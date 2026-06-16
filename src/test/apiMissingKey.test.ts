import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handleInsightRequest, handleWeeklyReportRequest } from '../../api/_lib/handlers';
import { resetRateLimitStore } from '../../api/_lib/rateLimit';
import { createInsight, createWeeklyReport } from '../../api/_lib/openai';
import { API_FOOTPRINT } from '@/test/helpers/apiTestMocks';

vi.mock('../../api/_lib/openai', () => ({
  createInsight: vi.fn().mockResolvedValue('Test insight'),
  createWeeklyReport: vi.fn().mockResolvedValue('Test weekly report'),
}));

describe('API handlers — missing OPENAI_API_KEY', () => {
  let originalKey: string | undefined;

  beforeEach(() => {
    resetRateLimitStore();
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
      { footprint: API_FOOTPRINT, recentActions: [], streakDays: 0 },
      'no-key-client'
    );
    expect(result.status).toBe(503);
    expect(result.body.error).toBe('AI insights are not configured on this server.');
  });

  it('returns 503 for weekly report when key is unset', async () => {
    const result = await handleWeeklyReportRequest(
      { footprint: API_FOOTPRINT, weeklyActionsCount: 2, co2SavedKg: 50 },
      'no-key-client'
    );
    expect(result.status).toBe(503);
    expect(result.body.error).toBe('AI insights are not configured on this server.');
  });
});
