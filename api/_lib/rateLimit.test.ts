import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimitStore } from '../../api/_lib/rateLimit.js';

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('allows requests under the limit', () => {
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit('client-a').allowed).toBe(true);
    }
  });

  it('blocks the 11th request within the window', () => {
    for (let i = 0; i < 10; i++) checkRateLimit('client-b');
    const result = checkRateLimit('client-b');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSec).toBeGreaterThan(0);
  });

  it('tracks clients independently', () => {
    for (let i = 0; i < 10; i++) checkRateLimit('client-c');
    expect(checkRateLimit('client-d').allowed).toBe(true);
  });
});
