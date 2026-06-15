/**
 * Security headers for HTML documents vs API JSON responses.
 * CSP applies only to documents — not API routes (avoids Chrome DevTools CSP issues).
 *
 * Production script-src uses SHA-256 hashes (see csp.generated.ts), not 'self',
 * so same-origin uploads or JSONP cannot execute as script.
 */
import { PRODUCTION_CONTENT_SECURITY_POLICY } from './csp.generated';

/** Relaxed CSP for Vite dev/preview (HMR websockets + fast refresh). */
const DEV_CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' ws: wss:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
] as const;

export const CONTENT_SECURITY_POLICY = PRODUCTION_CONTENT_SECURITY_POLICY;
export const DEV_CONTENT_SECURITY_POLICY = DEV_CSP_DIRECTIVES.join('; ');

const SHARED_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const DOCUMENT_SECURITY_HEADERS: Record<string, string> = {
  ...SHARED_HEADERS,
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
};

export const DEV_DOCUMENT_SECURITY_HEADERS: Record<string, string> = {
  ...SHARED_HEADERS,
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': DEV_CONTENT_SECURITY_POLICY,
};

/** API responses: no CSP (not applicable to JSON). */
export const API_SECURITY_HEADERS: Record<string, string> = {
  ...SHARED_HEADERS,
};

function applyHeaders(
  headers: Record<string, string>,
  setHeader: (name: string, value: string) => void
): void {
  for (const [name, value] of Object.entries(headers)) {
    setHeader(name, value);
  }
}

export function applyDocumentSecurityHeaders(
  setHeader: (name: string, value: string) => void,
  dev = false
): void {
  applyHeaders(dev ? DEV_DOCUMENT_SECURITY_HEADERS : DOCUMENT_SECURITY_HEADERS, setHeader);
}

export function applyApiSecurityHeaders(setHeader: (name: string, value: string) => void): void {
  applyHeaders(API_SECURITY_HEADERS, setHeader);
}

interface JsonResponder {
  status: (code: number) => JsonResponder;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

export function sendJsonResponse(res: JsonResponder, status: number, body: unknown): void {
  applyApiSecurityHeaders((name, value) => res.setHeader(name, value));
  res.status(status).json(body);
}

/** True when the request targets an HTML shell (SPA entry). */
export function isDocumentRequest(url: string | undefined, accept: string | undefined): boolean {
  if (!url) return false;
  const path = url.split('?')[0];
  if (path === '/' || path.endsWith('.html')) return true;
  if (path.startsWith('/api/') || path.startsWith('/assets/') || path.includes('.')) return false;
  // SPA client-side routes (no file extension)
  return accept?.includes('text/html') ?? false;
}
