import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_SECURITY_HEADERS,
  API_SECURITY_HEADERS,
  CONTENT_SECURITY_POLICY,
  DEV_CONTENT_SECURITY_POLICY,
  applyDocumentSecurityHeaders,
  applyApiSecurityHeaders,
  isDocumentRequest,
} from '../../api/_lib/securityHeaders';
import { PRODUCTION_SCRIPT_HASHES } from '../../api/_lib/csp.generated';

describe('securityHeaders', () => {
  it('includes clickjacking protection via X-Frame-Options and frame-ancestors', () => {
    expect(DOCUMENT_SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
  });

  it('includes MIME sniffing protection on document and API responses', () => {
    expect(DOCUMENT_SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(API_SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
  });

  it('production CSP allowlists scripts by SHA-256 hash, not self', () => {
    expect(CONTENT_SECURITY_POLICY).toMatch(/script-src 'sha256-/);
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/script-src 'self'/);
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/script-src[^;]*'self'/);
    expect(PRODUCTION_SCRIPT_HASHES.length).toBeGreaterThan(0);
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("base-uri 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toMatch(/worker-src 'sha256-/);
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/worker-src 'self'/);
    expect(CONTENT_SECURITY_POLICY).toContain("manifest-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("style-src-attr 'unsafe-inline'");
    expect(API_SECURITY_HEADERS['Content-Security-Policy']).toBeUndefined();
  });

  it('dev CSP allows HMR websockets and eval', () => {
    expect(DEV_CONTENT_SECURITY_POLICY).toContain("connect-src 'self' ws: wss:");
    expect(DEV_CONTENT_SECURITY_POLICY).toContain("'unsafe-eval'");
    expect(DEV_CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
  });

  it('applyDocumentSecurityHeaders sets CSP on HTML responses', () => {
    const set = new Map<string, string>();
    applyDocumentSecurityHeaders((name, value) => set.set(name, value));
    expect(set.get('Content-Security-Policy')).toBe(CONTENT_SECURITY_POLICY);
  });

  it('applyApiSecurityHeaders omits CSP', () => {
    const set = new Map<string, string>();
    applyApiSecurityHeaders((name, value) => set.set(name, value));
    expect(set.get('Content-Security-Policy')).toBeUndefined();
    expect(set.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('isDocumentRequest identifies SPA HTML entry points', () => {
    expect(isDocumentRequest('/', 'text/html')).toBe(true);
    expect(isDocumentRequest('/dashboard', 'text/html')).toBe(true);
    expect(isDocumentRequest('/api/insights', 'application/json')).toBe(false);
    expect(isDocumentRequest('/assets/index.js', 'application/javascript')).toBe(false);
  });
});
