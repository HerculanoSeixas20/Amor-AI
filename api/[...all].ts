import type { IncomingMessage, ServerResponse } from "http";
import app from "../server.ts";

/**
 * Rota catch-all nativa da Vercel para todos os endpoints da API (/api/*).
 * Garante que qualquer requisição /api/register-user, /api/login, etc. é tratada
 * com sucesso pelo Express mesmo na ausência de reescritas manuais de URL.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return new Promise((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);

    try {
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

      app(customReq, res);
    } catch (err: any) {
      console.error("[Vercel Catch-All API Error]:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "SERVERLESS_FUNCTION_ERROR",
            message: "Erro interno no processamento do pedido."
          },
          message: "Erro interno no processamento do pedido."
        }));
      }
      resolve(null);
    }
  });
}
