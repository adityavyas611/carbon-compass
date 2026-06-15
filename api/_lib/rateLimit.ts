const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(clientId: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = store.get(clientId);

  if (!entry || now >= entry.resetAt) {
    store.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetRateLimitStore(): void {
  store.clear();
}
