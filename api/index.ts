import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

/**
 * Ponto de entrada das Serverless Functions da Vercel para a API do Amor IA (/api).
 * Trata requisições para /api e qualquer subcaminho encaminhado por reescritas da Vercel (/api/*).
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;

  // 1. Extrair o URI original enviado pelo cliente
  const forwardedUri = 
    customReq.headers?.["x-forwarded-uri"] || 
    customReq.headers?.["x-real-url"] || 
    customReq.headers?.["x-original-url"];

  if (forwardedUri && typeof forwardedUri === "string" && forwardedUri.startsWith("/api")) {
    customReq.url = forwardedUri;
  } else if (customReq.query && (customReq.query.__path || customReq.query.path || customReq.query.all)) {
    // Parâmetro capturado pela reescrita vercel.json: /api?__path=$1
    const rawPath = customReq.query.__path || customReq.query.path || customReq.query.all;
    const pathStr = Array.isArray(rawPath) ? rawPath.join("/") : String(rawPath);
    const cleanPath = pathStr.replace(/^\/+/, "");
    
    // Preservar query parameters originais (excluindo os de controlo de reescrita)
    const urlParts = (customReq.url || "").split("?");
    const existingQs = urlParts[1] ? `?${urlParts[1]}` : "";
    customReq.url = `/api/${cleanPath}${existingQs}`;
  } else {
    // Garantir que a URL começa com /api
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

  return app(customReq, res);
}
