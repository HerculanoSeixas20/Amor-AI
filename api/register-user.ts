import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

/**
 * Serverless Function explícita para /api/register-user na Vercel.
 * Garante que a rota de registo nunca resulte em 404 HTML da Vercel.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;
  customReq.url = "/api/register-user";
  if (customReq.body !== undefined && !customReq._body) {
    customReq._body = true;
  }
  return app(customReq, res);
}
