/**
 * CSP builder — production scripts are allowlisted by SHA-256 hash, not 'self',
 * so same-origin JSONP endpoints or uploaded files cannot execute as script.
 */

export interface DocumentCspOptions {
  /** Base64 SHA-256 digests of allowed script file contents (no 'sha256-' prefix). */
  scriptHashes: string[];
  /** Base64 SHA-256 digests of allowed service-worker file contents. */
  workerHashes?: string[];
}

function hashSources(prefix: string, hashes: string[]): string {
  if (hashes.length === 0) return `${prefix} 'none'`;
  return `${prefix} ${hashes.map((h) => `'sha256-${h}'`).join(' ')}`;
}

export function buildDocumentCsp(options: DocumentCspOptions): string {
  const workerHashes = options.workerHashes ?? [];

  return [
    "default-src 'self'",
    hashSources('script-src', options.scriptHashes),
    "style-src 'self' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    hashSources('worker-src', workerHashes),
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ');
}
