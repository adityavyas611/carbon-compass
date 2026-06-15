/**
 * CSP builder for HTML documents.
 *
 * Vite emits same-origin <script type="module" src="/assets/..."> tags.
 * CSP hash allowlists only match inline script *content*, not external src URLs,
 * so production script-src must include 'self'.
 */

export const PRODUCTION_DOCUMENT_CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
] as const;

export function buildDocumentCsp(): string {
  return PRODUCTION_DOCUMENT_CSP_DIRECTIVES.join('; ');
}

export const PRODUCTION_CONTENT_SECURITY_POLICY = buildDocumentCsp();
