import { describe, it, expect } from 'vitest';
import {
  buildDocumentCsp,
  PRODUCTION_CONTENT_SECURITY_POLICY,
  PRODUCTION_DOCUMENT_CSP_DIRECTIVES,
} from '../../api/_lib/cspPolicy';

describe('buildDocumentCsp', () => {
  it('allows same-origin module scripts and workers (required for Vite bundles)', () => {
    const policy = buildDocumentCsp();
    expect(policy).toContain("script-src 'self'");
    expect(policy).toContain("worker-src 'self'");
    expect(policy).not.toMatch(/script-src[^;]*unsafe/);
  });

  it('blocks inline script injection vectors in production', () => {
    const policy = buildDocumentCsp();
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("frame-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it('exports a stable production policy constant', () => {
    expect(PRODUCTION_CONTENT_SECURITY_POLICY).toBe(
      PRODUCTION_DOCUMENT_CSP_DIRECTIVES.join('; ')
    );
  });
});
