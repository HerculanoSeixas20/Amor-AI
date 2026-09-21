import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

/**
 * Rota catch-all nativa da Vercel para todos os endpoints da API (/api/*).
 * Garante que qualquer requisição /api/register-user, /api/login, etc. é tratada
 * com sucesso pelo Express mesmo na ausência de reescritas manuais de URL.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;
  const matchedPath = customReq.headers?.["x-matched-path"] || customReq.headers?.["x-invoke-path"];
  if (matchedPath && typeof matchedPath === "string" && matchedPath.startsWith("/api")) {
    customReq.url = matchedPath;
  } else if (customReq.query && customReq.query.all) {
    const all = Array.isArray(customReq.query.all) ? customReq.query.all.join("/") : customReq.query.all;
    const queryString = customReq.url && customReq.url.includes("?") ? customReq.url.slice(customReq.url.indexOf("?")) : "";
    customReq.url = `/api/${all}${queryString}`;
  }
  return app(customReq, res);
}
