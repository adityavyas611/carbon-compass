import type { VercelRequest, VercelResponse } from './vercel';
import { getClientIp } from './vercel';
import { sendJsonResponse } from './securityHeaders';

export interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

export type ApiHandler = (body: unknown, clientId: string) => Promise<HandlerResult>;

export function createPostHandler(handle: ApiHandler) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { error: 'Method not allowed' });
      return;
    }
    const result = await handle(req.body, getClientIp(req));
    sendJsonResponse(res, result.status, result.body);
  };
}
