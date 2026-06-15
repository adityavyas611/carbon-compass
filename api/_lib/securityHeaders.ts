/**
 * Security headers applied to all HTTP responses (static + API).
 * Satisfies clickjacking, MIME sniffing, and CSP scanner requirements.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function applySecurityHeaders(setHeader: (name: string, value: string) => void): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    setHeader(name, value);
  }
}

interface JsonResponder {
  status: (code: number) => JsonResponder;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

export function sendJsonResponse(res: JsonResponder, status: number, body: unknown): void {
  applySecurityHeaders((name, value) => res.setHeader(name, value));
  res.status(status).json(body);
}
