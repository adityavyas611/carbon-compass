import { describe, it, expect } from 'vitest';
import { buildDocumentCsp } from '../../api/_lib/cspPolicy';

describe('buildDocumentCsp', () => {
  it('uses SHA-256 hashes instead of script-src self', () => {
    const policy = buildDocumentCsp({
      scriptHashes: ['abc123=', 'def456='],
      workerHashes: ['workerHash='],
    });
    expect(policy).toContain("script-src 'sha256-abc123=' 'sha256-def456='");
    expect(policy).not.toContain("script-src 'self'");
    expect(policy).toContain("worker-src 'sha256-workerHash='");
    expect(policy).not.toContain("worker-src 'self'");
  });

  it('falls back to none when no script hashes are provided', () => {
    const policy = buildDocumentCsp({ scriptHashes: [] });
    expect(policy).toContain("script-src 'none'");
  });
});
