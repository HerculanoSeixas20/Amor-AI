import type { IncomingMessage, ServerResponse } from "http";
import app from "../server.ts";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return new Promise((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);

    try {
      const customReq = req as any;
      customReq.url = "/api/health";
      app(customReq, res);
    } catch (err: any) {
      console.error("[Vercel /api/health Error]:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "SERVERLESS_FUNCTION_ERROR",
            message: "Health check error."
          }
        }));
      }
      resolve(null);
    }
  });
}
