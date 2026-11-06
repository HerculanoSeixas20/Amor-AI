import type { IncomingMessage, ServerResponse } from "http";
import app from "../server.ts";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return new Promise((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);

    try {
      const customReq = req as any;
      customReq.url = "/api/forgot-password";
      if (customReq.body !== undefined && !customReq._body) {
        customReq._body = true;
      }
      app(customReq, res);
    } catch (err: any) {
      console.error("[Vercel /api/forgot-password Error]:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "SERVERLESS_FUNCTION_ERROR",
            message: "Ocorreu um erro no serviço de recuperação de palavra-passe."
          },
          message: "Ocorreu um erro no serviço de recuperação de palavra-passe."
        }));
      }
      resolve(null);
    }
  });
}
