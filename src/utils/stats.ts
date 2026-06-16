import type { LoggedAction } from '@/types';
import { startOfDay, subDays } from 'date-fns';

export function sumLoggedActionsCo2(actions: LoggedAction[]): number {
  return actions.reduce((sum, a) => sum + a.co2SavedKg, 0);
}

export function getWeeklyActionStats(actions: LoggedAction[]): {
  count: number;
  co2SavedKg: number;
} {
  const weekAgo = startOfDay(subDays(new Date(), 7));
  const weekly = actions.filter((a) => new Date(a.date) >= weekAgo);
  return {
    count: weekly.length,
    co2SavedKg: sumLoggedActionsCo2(weekly),
  };
}

const GRADE_COLOR_CLASSES: Record<string, string> = {
  forest: 'text-forest-600',
  sage: 'text-sage-600',
  earth: 'text-earth-600',
  orange: 'text-orange-500',
  red: 'text-red-500',
};

export function getGradeColorClass(color: string | undefined): string {
  if (!color) return 'text-red-500';
  return GRADE_COLOR_CLASSES[color] ?? 'text-red-500';
}
