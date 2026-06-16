import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleWeeklyReportRequest } from '../../api/_lib/handlers';
import { resetRateLimitStore } from '../../api/_lib/rateLimit';
import { createWeeklyReport } from '../../api/_lib/openai';
import { API_FOOTPRINT } from '@/test/helpers/apiTestMocks';

vi.mock('../../api/_lib/openai', () => ({
  createInsight: vi.fn().mockResolvedValue('Test insight'),
  createWeeklyReport: vi.fn().mockResolvedValue('Test weekly report'),
}));

describe('handleWeeklyReportRequest', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    resetRateLimitStore();
    vi.clearAllMocks();
    vi.mocked(createWeeklyReport).mockResolvedValue('Test weekly report');
  });

  it('returns 200 with report for valid request', async () => {
    const result = await handleWeeklyReportRequest(
      { footprint: API_FOOTPRINT, weeklyActionsCount: 3, co2SavedKg: 150 },
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
        { footprint: API_FOOTPRINT, weeklyActionsCount: 1, co2SavedKg: 10 },
        'weekly-rate-client'
      );
    }
    const result = await handleWeeklyReportRequest(
      { footprint: API_FOOTPRINT, weeklyActionsCount: 1, co2SavedKg: 10 },
      'weekly-rate-client'
    );
    expect(result.status).toBe(429);
    expect(result.body.error).toContain('Rate limit exceeded');
  });

  it('returns 500 when createWeeklyReport throws a generic error', async () => {
    vi.mocked(createWeeklyReport).mockRejectedValueOnce(new Error('OpenAI timeout'));
    const result = await handleWeeklyReportRequest(
      { footprint: API_FOOTPRINT, weeklyActionsCount: 2, co2SavedKg: 50 },
      'weekly-error-client'
    );
    expect(result.status).toBe(500);
    expect(result.body.error).toBe('Unable to generate report. Please try again later.');
  });
});
