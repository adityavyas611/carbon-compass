import { describe, it, expect, vi } from 'vitest';
import { createPostHandler } from '../../api/_lib/createPostHandler';
import type { VercelRequest, VercelResponse } from '../../api/_lib/vercel';

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: new Map<string, string>(),
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers.set(name, value);
    },
    json(body: unknown) {
      this.body = body;
    },
  };
  return res as typeof res & VercelResponse;
}

describe('createPostHandler', () => {
  it('returns 405 for non-POST requests', async () => {
    const handler = createPostHandler(vi.fn());
    const res = mockResponse();
    await handler({ method: 'GET', headers: {} } as VercelRequest, res);
    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ error: 'Method not allowed' });
  });

  it('delegates POST body to the handler with client IP', async () => {
    const handle = vi.fn().mockResolvedValue({ status: 200, body: { ok: true } });
    const handler = createPostHandler(handle);
    const res = mockResponse();
    await handler(
      {
        method: 'POST',
        body: { foo: 'bar' },
        headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
      } as VercelRequest,
      res
    );
    expect(handle).toHaveBeenCalledWith({ foo: 'bar' }, '203.0.113.1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
