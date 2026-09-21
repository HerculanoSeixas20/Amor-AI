/**
 * apiFetch - Utilitário central de rede com blindagem contra erros de JSON
 * Garante que qualquer resposta HTML (ex: 302, 404, 502) nunca cause SyntaxError ao chamar .json()
 */

function shieldResponse(response: Response, url: string): Response {
  // Clonar leitura de texto para nunca quebrar o fluxo nativo
  const originalJson = response.json.bind(response);
  
  response.json = async () => {
    try {
      const text = await response.text();
      const trimmed = text.trim();
      const looksLikeJson = 
        (trimmed.startsWith("{") && trimmed.endsWith("}")) || 
        (trimmed.startsWith("[") && trimmed.endsWith("]"));

      if (!looksLikeJson) {
        const preview = trimmed.substring(0, 120);
        console.warn(`[apiFetch non-JSON intercepted] ${url} Status: ${response.status}:`, preview);

        let friendlyMsg = "O servidor devolveu uma resposta não reconhecida. Por favor, tente novamente.";
        if (response.status === 404) {
          friendlyMsg = "Endpoint de serviço não encontrado (404).";
        } else if (response.status === 409) {
          friendlyMsg = "Este e-mail já se encontra registado.";
        } else if (response.status >= 500) {
          friendlyMsg = "Serviço temporariamente indisponível. A restabelecer ligação...";
        } else if (preview.toLowerCase().includes("the page") || preview.toLowerCase().includes("cannot be found")) {
          friendlyMsg = "Serviço temporariamente indisponível na infraestrutura de produção.";
        }

        return {
          success: false,
          error: friendlyMsg,
          message: friendlyMsg,
          rawPreview: preview,
          status: response.status
        };
      }

      return JSON.parse(text);
    } catch (parseErr) {
      console.warn(`[apiFetch JSON parse error intercepted] ${url}:`, parseErr);
      return {
        success: false,
        error: "Dados recebidos em formato não reconhecido. Tente novamente.",
        message: "Dados recebidos em formato não reconhecido. Tente novamente.",
        status: response.status
      };
    }
  };

  return response;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const provider = localStorage.getItem("amor_ia_ai_provider") || "gemini";
  const savedUser = localStorage.getItem("amor_ia_user");
  let userEmail = "";
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      userEmail = user?.email || "";
    } catch (e) {
      // Ignorar erros de análise sintática
    }
  }

  // Verificar se o pedido é direcionado para a nossa API local
  const url = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);
  const isApiCall = url.startsWith("/api/") || url.includes("/api/");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  if (isApiCall) {
    headers["x-ai-provider"] = provider;
    headers["x-user-email"] = userEmail;
    if (!headers["X-Request-ID"]) {
      headers["X-Request-ID"] = (typeof crypto !== "undefined" && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : "req_" + Math.random().toString(36).substring(2, 9);
    }
  }

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await window.fetch(input, {
        ...init,
        headers,
      });

      return shieldResponse(response, url);
    } catch (netErr: any) {
      if (attempt < maxAttempts) {
        // Aguardar breve intervalo antes de tentar novamente (contingência para reinício de servidor)
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        continue;
      }

      console.warn(`[apiFetch network failure] ${url}:`, netErr?.message || netErr);
      // Retornar um objeto Response emulado para evitar crash instantâneo
      const errorResp = new Response(
        JSON.stringify({
          success: false,
          error: "Falha de ligação ao servidor. Por favor, tente novamente.",
          message: "Falha de ligação ao servidor. Por favor, tente novamente."
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }
      );
      return shieldResponse(errorResp, url);
    }
  }

  // Fallback de segurança se sair do loop
  const fallback = new Response(
    JSON.stringify({ 
      success: false, 
      error: "Serviço temporariamente inacessível.", 
      message: "Serviço temporariamente inacessível." 
    }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
  return shieldResponse(fallback, url);
}

/**
 * Blindagem opcional no fetch com proteção estrita contra ambientes onde window.fetch é getter-only
 */
export function initGlobalNetworkShield() {
  if (typeof window === "undefined" || (window as any).__amor_ia_fetch_shielded) {
    return;
  }

  try {
    const originalFetch = window.fetch.bind(window);
    const safeFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === "string" ? input : (input instanceof URL ? input.href : (input as any)?.url || "");
      try {
        const response = await originalFetch(input, init);
        return shieldResponse(response, url);
      } catch (err) {
        throw err;
      }
    };

    // Tentar redefinir via Object.defineProperty com fallback silencioso
    try {
      Object.defineProperty(window, "fetch", {
        value: safeFetch,
        writable: true,
        configurable: true
      });
      (window as any).__amor_ia_fetch_shielded = true;
    } catch {
      // Ambiente do browser/iframe restringe redefinição de window.fetch; apiFetch e apiRequest já operam de forma protegida
    }
  } catch (err) {
    // Silenciosamente ignorar
  }
}
