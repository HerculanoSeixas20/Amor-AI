import type { IncomingMessage, ServerResponse } from "http";
import app from "../server.ts";

/**
 * Serverless Function explícita para /api/login na Vercel.
 * Garante que a rota de login nunca resulte em 404 HTML da Vercel nem FUNCTION_INVOCATION_FAILED.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return new Promise((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);

    try {
      const customReq = req as any;
      customReq.url = "/api/login";
      
      if (customReq.body !== undefined && !customReq._body) {
        customReq._body = true;
      }

      app(customReq, res);
    } catch (err: any) {
      console.error("[Vercel /api/login Error]:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "SERVERLESS_FUNCTION_ERROR",
            message: "Ocorreu um erro ao processar o login. Por favor, tente novamente."
          },
          message: "Ocorreu um erro ao processar o login. Por favor, tente novamente."
        }));
      }
      resolve(null);
    }
  });
}
