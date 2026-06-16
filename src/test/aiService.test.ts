import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetAiRateLimiter } from '@/services/aiService';

const FOOTPRINT = { transport: 1000, energy: 500, diet: 800, shopping: 300, total: 2600 };

describe('aiService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    resetAiRateLimiter();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('generateInsight', () => {
    it('returns insight from API response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ insight: 'Great job reducing your transport footprint!' }),
      } as Response);

      const { generateInsight } = await import('@/services/aiService');
      const result = await generateInsight(FOOTPRINT, ['plant-meal'], 5);
      expect(result).toBe('Great job reducing your transport footprint!');
    });

    it('throws with server error message on failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'AI insights are not configured on this server.' }),
      } as Response);

      const { generateInsight } = await import('@/services/aiService');
      await expect(generateInsight(FOOTPRINT, [], 0)).rejects.toThrow(
        'AI insights are not configured on this server.'
      );
    });

    it('POSTs to /api/insights with correct payload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ insight: 'ok' }),
      } as Response);

      const { generateInsight } = await import('@/services/aiService');
      await generateInsight(FOOTPRINT, ['plant-meal'], 3);

      expect(fetch).toHaveBeenCalledWith('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footprint: FOOTPRINT,
          recentActions: ['plant-meal'],
          streakDays: 3,
        }),
      });
    });
  });

  describe('generateWeeklyReport', () => {
    it('returns report from API response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ report: 'Amazing week! You saved 150 kg.' }),
      } as Response);

      const { generateWeeklyReport } = await import('@/services/aiService');
      const result = await generateWeeklyReport(FOOTPRINT, 3, 150);
      expect(result).toBe('Amazing week! You saved 150 kg.');
    });

    it('POSTs to /api/weekly-report', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ report: 'ok' }),
      } as Response);

      const { generateWeeklyReport } = await import('@/services/aiService');
      await generateWeeklyReport(FOOTPRINT, 5, 250);

      expect(fetch).toHaveBeenCalledWith('/api/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footprint: FOOTPRINT,
          weeklyActionsCount: 5,
          co2SavedKg: 250,
        }),
      });
    });
  });

  describe('canMakeAiRequest', () => {
    it('blocks rapid successive calls', async () => {
      const { canMakeAiRequest } = await import('@/services/aiService');
      expect(canMakeAiRequest()).toBe(true);
      expect(canMakeAiRequest()).toBe(false);
    });
  });
});
