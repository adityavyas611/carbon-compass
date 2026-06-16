import type { MonthlyData } from '@/types';

export function upsertAssessmentMonth(
  history: MonthlyData[],
  month: string,
  footprintKg: number
): MonthlyData[] {
  const exists = history.some((m) => m.month === month);
  if (exists) {
    return history.map((m) => (m.month === month ? { ...m, footprintKg } : m));
  }
  return [...history, { month, footprintKg, actionsCompleted: 0, co2SavedKg: 0 }];
}

export function recordLoggedActionMonth(
  history: MonthlyData[],
  month: string,
  footprintKg: number,
  co2SavedKg: number
): MonthlyData[] {
  const existing = history.find((m) => m.month === month);
  if (existing) {
    return history.map((m) =>
      m.month === month
        ? { ...m, actionsCompleted: m.actionsCompleted + 1, co2SavedKg: m.co2SavedKg + co2SavedKg }
        : m
    );
  }
  return [
    ...history,
    { month, footprintKg, actionsCompleted: 1, co2SavedKg },
  ];
}
