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
  }

  return window.fetch(input, {
    ...init,
    headers,
  });
}
