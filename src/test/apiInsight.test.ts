import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleInsightRequest } from '../../api/_lib/handlers';
import { resetRateLimitStore } from '../../api/_lib/rateLimit';
import { createInsight } from '../../api/_lib/openai';
import { API_FOOTPRINT } from '@/test/helpers/apiTestMocks';

vi.mock('../../api/_lib/openai', () => ({
  createInsight: vi.fn().mockResolvedValue('Test insight'),
  createWeeklyReport: vi.fn().mockResolvedValue('Test weekly report'),
}));

describe('handleInsightRequest', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    resetRateLimitStore();
    vi.clearAllMocks();
    vi.mocked(createInsight).mockResolvedValue('Test insight');
  });

  it('returns 200 with insight for valid request', async () => {
    const result = await handleInsightRequest(
      { footprint: API_FOOTPRINT, recentActions: ['plant-meal'], streakDays: 5 },
      'test-client'
    );
    expect(result.status).toBe(200);
    expect(result.body.insight).toBe('Test insight');
  });

  it('returns 422 for invalid request', async () => {
    const result = await handleInsightRequest({ invalid: true }, 'test-client');
    expect(result.status).toBe(422);
    expect(result.body.error).toBe('Invalid request data');
  });

  it('returns 429 when rate limit exceeded', async () => {
    for (let i = 0; i < 10; i++) {
      await handleInsightRequest(
        { footprint: API_FOOTPRINT, recentActions: [], streakDays: 0 },
        'rate-test-client'
      );
    }
    const result = await handleInsightRequest(
      { footprint: API_FOOTPRINT, recentActions: [], streakDays: 0 },
      'rate-test-client'
    );
    expect(result.status).toBe(429);
    expect(result.body.error).toContain('Rate limit exceeded');
  });

  it('returns 500 when createInsight throws a generic error', async () => {
    vi.mocked(createInsight).mockRejectedValueOnce(new Error('OpenAI network failure'));
    const result = await handleInsightRequest(
      { footprint: API_FOOTPRINT, recentActions: [], streakDays: 0 },
      'error-test-client'
    );
    expect(result.status).toBe(500);
    expect(result.body.error).toBe('Unable to generate insight. Please try again later.');
  });
});
