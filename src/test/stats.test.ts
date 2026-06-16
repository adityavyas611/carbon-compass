import { describe, it, expect } from 'vitest';
import { sumLoggedActionsCo2, getWeeklyActionStats, getGradeColorClass } from '@/utils/stats';
import type { LoggedAction } from '@/types';

describe('stats utils', () => {
  it('sumLoggedActionsCo2 totals co2SavedKg', () => {
    const actions: LoggedAction[] = [
      { actionId: 'a', date: '2026-01-01', co2SavedKg: 100 },
      { actionId: 'b', date: '2026-01-02', co2SavedKg: 50 },
    ];
    expect(sumLoggedActionsCo2(actions)).toBe(150);
  });

  it('getWeeklyActionStats counts actions within the last 7 days', () => {
    const today = new Date().toISOString().slice(0, 10);
    const actions: LoggedAction[] = [
      { actionId: 'a', date: today, co2SavedKg: 10 },
      { actionId: 'b', date: '2020-01-01', co2SavedKg: 99 },
    ];
    const stats = getWeeklyActionStats(actions);
    expect(stats.count).toBe(1);
    expect(stats.co2SavedKg).toBe(10);
  });

  it('getGradeColorClass maps grade colors to Tailwind classes', () => {
    expect(getGradeColorClass('forest')).toBe('text-forest-600');
    expect(getGradeColorClass(undefined)).toBe('text-red-500');
  });
});
