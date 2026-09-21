/**
 * apiFetch - Utilitário central de rede com blindagem contra erros de JSON
 * Garante que qualquer resposta HTML (ex: 302, 404, 502) nunca cause SyntaxError ao chamar .json()
 */

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

      // Blindagem de .json() para impedir "Unexpected token 'T', 'The page c...' is not valid JSON"
      const originalJson = response.json.bind(response);
      response.json = async () => {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await response.text().catch(() => "");
          const preview = text.substring(0, 100);
          console.warn(`[apiFetch non-JSON response] ${url} Status: ${response.status}:`, preview);

          let friendlyMsg = "O servidor devolveu uma resposta inesperada. Por favor, tente novamente.";
          if (response.status === 404) {
            friendlyMsg = "Endpoint de serviço não encontrado (404).";
          } else if (response.status >= 500) {
            friendlyMsg = "Serviço temporariamente indisponível. A restabelecer ligação...";
          }

          return {
            success: false,
            error: friendlyMsg,
            rawPreview: preview,
            status: response.status
          };
        }

        try {
          return await originalJson();
        } catch (jsonErr) {
          console.warn(`[apiFetch JSON parse error] ${url}:`, jsonErr);
          return {
            success: false,
            error: "Dados recebidos em formato não reconhecido. Tente novamente.",
            status: response.status
          };
        }
      };

      return response;
    } catch (netErr: any) {
      if (attempt < maxAttempts) {
        // Aguardar breve intervalo antes de tentar novamente (contingência para reinício de servidor)
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        continue;
      }

      console.warn(`[apiFetch network failure] ${url}:`, netErr?.message || netErr);
      // Retornar um objeto Response emulado para evitar crash instantâneo
      return new Response(
        JSON.stringify({
          success: false,
          error: "Falha de ligação ao servidor. A sincronizar dados..."
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }

  // Fallback de segurança se sair do loop
  return new Response(
    JSON.stringify({ success: false, error: "Serviço temporariamente inacessível." }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}
