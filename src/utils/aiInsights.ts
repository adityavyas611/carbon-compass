import type { FootprintBreakdown } from '@/types';

const MIN_INTERVAL_MS = 3000;
let lastRequestAt = 0;

export function canMakeAiRequest(): boolean {
  const now = Date.now();
  if (now - lastRequestAt < MIN_INTERVAL_MS) return false;
  lastRequestAt = now;
  return true;
}

export function resetAiRateLimiter(): void {
  lastRequestAt = 0;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
}

export async function generateInsight(
  footprint: FootprintBreakdown,
  recentActions: string[],
  streakDays: number
): Promise<string> {
  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ footprint, recentActions, streakDays }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  const data = (await res.json()) as { insight: string };
  return data.insight;
}

export async function generateWeeklyReport(
  footprint: FootprintBreakdown,
  weeklyActionsCount: number,
  co2SavedKg: number
): Promise<string> {
  const res = await fetch('/api/weekly-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ footprint, weeklyActionsCount, co2SavedKg }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  const data = (await res.json()) as { report: string };
  return data.report;
}
