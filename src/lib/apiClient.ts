/**
 * Cliente de API Centralizado e Seguro para o Amor IA.
 * 
 * Garante:
 * 1. Tratamento seguro de Content-Type (nunca tenta fazer res.json() em HTML ou texto puro).
 * 2. Mensagens de erro amigáveis em Português.
 * 3. Propagação de X-Request-ID para auditoria e rastreio.
 * 4. Tipagem forte e padronizada.
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  requestId?: string;
  [key: string]: any;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload | string;
  message?: string;
  requestId?: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;
  details?: any;

  constructor(message: string, code = "API_ERROR", status = 500, requestId?: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "req_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const requestId = headers.get("X-Request-ID") || generateRequestId();
  headers.set("X-Request-ID", requestId);

  let response: Response | null = null;
  let lastNetworkError: any = null;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      response = await fetch(endpoint, {
        ...options,
        headers
      });
      break;
    } catch (networkError: any) {
      lastNetworkError = networkError;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
      }
    }
  }

  if (!response) {
    console.warn(`[API Network Warning] Falha de ligação ao endpoint ${endpoint} (ReqID: ${requestId}):`, lastNetworkError?.message || lastNetworkError);
    throw new ApiError(
      "Não foi possível conectar ao servidor. Por favor, verifique a sua ligação à internet.",
      "NETWORK_ERROR",
      0,
      requestId
    );
  }

  const responseReqId = response.headers.get("X-Request-ID") || requestId;
  const contentType = response.headers.get("content-type") || "";

  // 1. Ler o corpo como texto em primeiro lugar para evitar bloqueio de stream e SyntaxErrors nativos
  const rawText = await response.text().catch(() => "");
  const trimmed = rawText.trim();
  const isJsonHeader = contentType.includes("application/json");
  const looksLikeJson = (trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"));

  // 2. Se a resposta NÃO for JSON (ex: HTML de erro de servidor, página 404 Vercel, 502 Bad Gateway)
  if (!isJsonHeader || !looksLikeJson) {
    const preview = trimmed.substring(0, 160);
    console.warn(`[API Non-JSON Response] ${endpoint} Status: ${response.status} (ReqID: ${responseReqId}):`, preview);

    let friendlyMessage = "O servidor devolveu uma resposta não reconhecida. Por favor, tente novamente.";

    if (response.status === 404) {
      friendlyMessage = "O serviço solicitado não foi encontrado no servidor (404).";
    } else if (response.status === 409) {
      friendlyMessage = "Este e-mail já se encontra registado. Aceda com a sua palavra-passe.";
    } else if (response.status === 502 || response.status === 503 || response.status === 504) {
      friendlyMessage = "Serviço temporariamente indisponível. Estamos a restabelecer a ligação.";
    } else if (response.status === 401 || response.status === 403) {
      friendlyMessage = "Acesso não autorizado ou sessão expirada. Por favor, inicie sessão.";
    } else if (preview.toLowerCase().includes("the page") || preview.toLowerCase().includes("cannot be found") || preview.toLowerCase().includes("not found")) {
      friendlyMessage = "O serviço solicitado está temporariamente indisponível na infraestrutura de produção. Tente novamente em instantes.";
    }

    throw new ApiError(
      friendlyMessage,
      response.status === 409 ? "ACCOUNT_EXISTS" : "INVALID_CONTENT_TYPE",
      response.status,
      responseReqId,
      { rawPreview: preview }
    );
  }

  // 3. Tentar parsear o JSON com proteção total
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch (jsonErr: any) {
    console.warn(`[API JSON Parse Error] ${endpoint} (ReqID: ${responseReqId}):`, jsonErr);
    throw new ApiError(
      "Resposta do servidor em formato inválido. Tente novamente.",
      "JSON_PARSE_ERROR",
      response.status,
      responseReqId,
      { rawPreview: trimmed.substring(0, 100) }
    );
  }

  // Se o status HTTP indicar erro (não 2xx)
  if (!response.ok) {
    let errorMessage = "Ocorreu um erro ao processar a operação.";
    let errorCode = `HTTP_${response.status}`;

    if (data) {
      if (typeof data.error === "string") {
        errorMessage = data.error;
      } else if (data.error && typeof data.error === "object") {
        errorMessage = data.error.message || errorMessage;
        errorCode = data.error.code || errorCode;
      } else if (typeof data.message === "string") {
        errorMessage = data.message;
      }
    }

    // Tratamento específico de status comuns
    if (response.status === 409 && errorCode === `HTTP_409`) {
      errorCode = "ACCOUNT_EXISTS";
    }

    console.warn(`[API Error Response] ${endpoint} Status: ${response.status} Code: ${errorCode} (ReqID: ${responseReqId}):`, errorMessage);
    throw new ApiError(errorMessage, errorCode, response.status, responseReqId, data?.error?.details || data);
  }

  return data as T;
}
