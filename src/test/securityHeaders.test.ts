import { describe, it, expect } from 'vitest';
import {
  SECURITY_HEADERS,
  CONTENT_SECURITY_POLICY,
  applySecurityHeaders,
} from '../../api/_lib/securityHeaders';

describe('securityHeaders', () => {
  it('includes clickjacking protection via X-Frame-Options and frame-ancestors', () => {
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
  });

  it('includes MIME sniffing protection', () => {
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
  });

  it('includes required CSP directives', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("base-uri 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-src 'none'");
  });

  it('applySecurityHeaders sets all headers on the response', () => {
    const set = new Map<string, string>();
    applySecurityHeaders((name, value) => set.set(name, value));
    expect(set.size).toBe(Object.keys(SECURITY_HEADERS).length);
    expect(set.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
