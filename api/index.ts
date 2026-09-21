import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

/**
 * Ponto de entrada das Serverless Functions da Vercel para a API do Amor IA (/api).
 * Encaminha todas as requisições para a aplicação Express do servidor backend.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;
  const matchedPath = customReq.headers?.["x-matched-path"] || customReq.headers?.["x-invoke-path"];
  if (matchedPath && typeof matchedPath === "string" && matchedPath.startsWith("/api")) {
    customReq.url = matchedPath;
  }
  return app(customReq, res);
}
