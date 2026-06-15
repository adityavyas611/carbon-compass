import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleInsightRequest, handleWeeklyReportRequest } from '../../api/_lib/handlers';
import { resetRateLimitStore } from '../../api/_lib/rateLimit';

vi.mock('../../api/_lib/openai', () => ({
  createInsight: vi.fn().mockResolvedValue('Test insight'),
  createWeeklyReport: vi.fn().mockResolvedValue('Test weekly report'),
}));

const FOOTPRINT = {
  transport: 1000,
  energy: 500,
  diet: 800,
  shopping: 300,
  total: 2600,
};

describe('API handlers', () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.clearAllMocks();
  });

  describe('handleInsightRequest', () => {
    it('returns 200 with insight for valid request', async () => {
      const result = await handleInsightRequest(
        { footprint: FOOTPRINT, recentActions: ['plant-meal'], streakDays: 5 },
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
          { footprint: FOOTPRINT, recentActions: [], streakDays: 0 },
          'rate-test-client'
        );
      }
      const result = await handleInsightRequest(
        { footprint: FOOTPRINT, recentActions: [], streakDays: 0 },
        'rate-test-client'
      );
      expect(result.status).toBe(429);
      expect(result.body.error).toContain('Rate limit exceeded');
    });
  });

  describe('handleWeeklyReportRequest', () => {
    it('returns 200 with report for valid request', async () => {
      const result = await handleWeeklyReportRequest(
        { footprint: FOOTPRINT, weeklyActionsCount: 3, co2SavedKg: 150 },
        'test-client'
      );
      expect(result.status).toBe(200);
      expect(result.body.report).toBe('Test weekly report');
    });

    it('returns 422 for invalid request', async () => {
      const result = await handleWeeklyReportRequest({}, 'test-client');
      expect(result.status).toBe(422);
      expect(result.body.error).toBe('Invalid request data');
    });
  });
});
