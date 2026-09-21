import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;
  customReq.url = "/api/health";
  return app(customReq, res);
}
