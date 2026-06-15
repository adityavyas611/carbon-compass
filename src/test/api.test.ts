import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handleInsightRequest, handleWeeklyReportRequest } from '../../api/_lib/handlers';
import { resetRateLimitStore } from '../../api/_lib/rateLimit';
import { createInsight, createWeeklyReport } from '../../api/_lib/openai';
import { SAMPLE_FOOTPRINT } from '@/test/fixtures';

vi.mock('../../api/_lib/openai', () => ({
  createInsight: vi.fn().mockResolvedValue('Test insight'),
  createWeeklyReport: vi.fn().mockResolvedValue('Test weekly report'),
}));

const FOOTPRINT = SAMPLE_FOOTPRINT;

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

    it('returns 500 when createInsight throws a generic error', async () => {
      vi.mocked(createInsight).mockRejectedValueOnce(new Error('OpenAI network failure'));
      const result = await handleInsightRequest(
        { footprint: FOOTPRINT, recentActions: [], streakDays: 0 },
        'error-test-client'
      );
      expect(result.status).toBe(500);
      expect(result.body.error).toBe('Unable to generate insight. Please try again later.');
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

    it('returns 429 when rate limit exceeded', async () => {
      for (let i = 0; i < 10; i++) {
        await handleWeeklyReportRequest(
          { footprint: FOOTPRINT, weeklyActionsCount: 1, co2SavedKg: 10 },
          'weekly-rate-client'
        );
      }
      const result = await handleWeeklyReportRequest(
        { footprint: FOOTPRINT, weeklyActionsCount: 1, co2SavedKg: 10 },
        'weekly-rate-client'
      );
      expect(result.status).toBe(429);
      expect(result.body.error).toContain('Rate limit exceeded');
    });

    it('returns 500 when createWeeklyReport throws a generic error', async () => {
      vi.mocked(createWeeklyReport).mockRejectedValueOnce(new Error('OpenAI timeout'));
      const result = await handleWeeklyReportRequest(
        { footprint: FOOTPRINT, weeklyActionsCount: 2, co2SavedKg: 50 },
        'weekly-error-client'
      );
      expect(result.status).toBe(500);
      expect(result.body.error).toBe('Unable to generate report. Please try again later.');
    });
  });

  describe('missing OPENAI_API_KEY', () => {
    let originalKey: string | undefined;

    beforeEach(async () => {
      originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      vi.mocked(createInsight).mockRejectedValue(new Error('OPENAI_API_KEY not configured'));
      vi.mocked(createWeeklyReport).mockRejectedValue(new Error('OPENAI_API_KEY not configured'));
    });

    afterEach(() => {
      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
      vi.mocked(createInsight).mockResolvedValue('Test insight');
      vi.mocked(createWeeklyReport).mockResolvedValue('Test weekly report');
    });

    it('returns 503 for insight requests when key is unset', async () => {
      const result = await handleInsightRequest(
        { footprint: FOOTPRINT, recentActions: [], streakDays: 0 },
        'no-key-client'
      );
      expect(result.status).toBe(503);
      expect(result.body.error).toBe('AI insights are not configured on this server.');
    });

    it('returns 503 for weekly report when key is unset', async () => {
      const result = await handleWeeklyReportRequest(
        { footprint: FOOTPRINT, weeklyActionsCount: 2, co2SavedKg: 50 },
        'no-key-client'
      );
      expect(result.status).toBe(503);
      expect(result.body.error).toBe('AI insights are not configured on this server.');
    });
  });
});
