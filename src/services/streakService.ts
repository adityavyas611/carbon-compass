import type { Streak } from '@/types';
import { format } from 'date-fns';

export function computeStreakUpdate(streak: Streak, today: string): Streak {
  if (streak.lastLogDate === today) return streak;

  const yesterday = format(new Date(Date.now() - 86_400_000), 'yyyy-MM-dd');
  const currentDays = streak.lastLogDate === yesterday ? streak.currentDays + 1 : 1;

  return {
    currentDays,
    longestDays: Math.max(currentDays, streak.longestDays),
    lastLogDate: today,
  };
}
