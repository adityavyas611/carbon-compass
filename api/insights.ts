import { handleInsightRequest } from './_lib/handlers';
import { sendJsonResponse } from './_lib/securityHeaders';

interface VercelRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendJsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    'unknown';

  const result = await handleInsightRequest(req.body, clientIp);
  return sendJsonResponse(res, result.status, result.body);
}
