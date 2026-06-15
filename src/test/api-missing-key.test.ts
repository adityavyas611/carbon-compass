import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handleInsightRequest, handleWeeklyReportRequest } from '../../api/_lib/handlers';
import { resetRateLimitStore } from '../../api/_lib/rateLimit';

const FOOTPRINT = {
  transport: 1000,
  energy: 500,
  diet: 800,
  shopping: 300,
  total: 2600,
};

describe('API handlers — missing OPENAI_API_KEY', () => {
  let originalKey: string | undefined;

  beforeEach(() => {
    resetRateLimitStore();
    originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
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
