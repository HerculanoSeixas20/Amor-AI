import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

/**
 * Rota catch-all nativa da Vercel para todos os endpoints da API (/api/*).
 * Garante que qualquer requisição /api/register-user, /api/login, etc. é tratada
 * com sucesso pelo Express mesmo na ausência de reescritas manuais de URL.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;

  // 1. Extrair o URI original enviado pelo cliente
  const forwardedUri = 
    customReq.headers?.["x-forwarded-uri"] || 
    customReq.headers?.["x-real-url"] || 
    customReq.headers?.["x-original-url"];

  if (forwardedUri && typeof forwardedUri === "string" && forwardedUri.startsWith("/api")) {
    customReq.url = forwardedUri;
  } else if (customReq.query && (customReq.query.all || customReq.query.__path || customReq.query.path)) {
    const rawPath = customReq.query.all || customReq.query.__path || customReq.query.path;
    const pathStr = Array.isArray(rawPath) ? rawPath.join("/") : String(rawPath);
    const cleanPath = pathStr.replace(/^\/+/, "");
    
    const urlParts = (customReq.url || "").split("?");
    const existingQs = urlParts[1] ? `?${urlParts[1]}` : "";
    customReq.url = `/api/${cleanPath}${existingQs}`;
  } else {
    let url = customReq.url || "/api";
    if (!url.startsWith("/api")) {
      url = `/api${url.startsWith("/") ? url : "/" + url}`;
    }
    customReq.url = url;
  }

  // 2. Prevenir bloqueio de stream de corpo já consumido no runtime da Vercel
  if (customReq.body !== undefined && !customReq._body) {
    customReq._body = true;
  }

  return app(customReq, res);
}
