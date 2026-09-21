import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const customReq = req as any;
  customReq.url = "/api/dashboard-insights";
  if (customReq.body !== undefined && !customReq._body) {
    customReq._body = true;
  }
  return app(customReq, res);
}
