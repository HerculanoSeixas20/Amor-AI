import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

/**
 * Serverless Function explícita para /api/user-subscription na Vercel.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;
  const qs = customReq.url && customReq.url.includes("?") ? customReq.url.slice(customReq.url.indexOf("?")) : "";
  customReq.url = `/api/user-subscription${qs}`;
  if (customReq.body !== undefined && !customReq._body) {
    customReq._body = true;
  }
  return app(customReq, res);
}
