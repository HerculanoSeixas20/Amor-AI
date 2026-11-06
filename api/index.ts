import type { IncomingMessage, ServerResponse } from "http";
import app from "../server.ts";

/**
 * Ponto de entrada central das Serverless Functions da Vercel para a API do Amor IA (/api).
 * Trata requisições para /api e qualquer subcaminho encaminhado por reescritas da Vercel (/api/*).
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
        customReq.headers?.["x-matched-path"] || 
        customReq.headers?.["x-real-url"] || 
        customReq.headers?.["x-original-url"];

      if (forwardedUri && typeof forwardedUri === "string" && forwardedUri.startsWith("/api")) {
        customReq.url = forwardedUri;
      } else if (customReq.query && (customReq.query.__path || customReq.query.path || customReq.query.all)) {
        // Parâmetro capturado pela reescrita vercel.json: /api?__path=$1
        const rawPath = customReq.query.__path || customReq.query.path || customReq.query.all;
        const pathStr = Array.isArray(rawPath) ? rawPath.join("/") : String(rawPath);
        const cleanPath = pathStr.replace(/^\/+/, "");
        
        // Preservar query parameters originais
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

      // 2. Prevenir que o Express tente ler novamente um stream de corpo já consumido no runtime da Vercel
      if (customReq.body !== undefined && !customReq._body) {
        customReq._body = true;
      }

      app(customReq, res);
    } catch (err: any) {
      console.error("[Vercel /api/index Error]:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "SERVERLESS_FUNCTION_ERROR",
            message: "Ocorreu um erro no servidor da API. Por favor, tente novamente."
          },
          message: "Ocorreu um erro no servidor da API. Por favor, tente novamente."
        }));
      }
      resolve(null);
    }
  });
}
