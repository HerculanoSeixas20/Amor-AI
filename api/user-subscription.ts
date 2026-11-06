import type { IncomingMessage, ServerResponse } from "http";
import app from "../server.ts";

/**
 * Serverless Function explícita para /api/user-subscription na Vercel.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return new Promise((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);

    try {
      const customReq = req as any;
      const qs = customReq.url && customReq.url.includes("?") ? customReq.url.slice(customReq.url.indexOf("?")) : "";
      customReq.url = `/api/user-subscription${qs}`;
      if (customReq.body !== undefined && !customReq._body) {
        customReq._body = true;
      }
      app(customReq, res);
    } catch (err: any) {
      console.error("[Vercel /api/user-subscription Error]:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "SERVERLESS_FUNCTION_ERROR",
            message: "Erro ao verificar estado da subscrição."
          },
          message: "Erro ao verificar estado da subscrição."
        }));
      }
      resolve(null);
    }
  });
}
