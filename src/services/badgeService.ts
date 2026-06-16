import type { Badge, LoggedAction, ActivityLog, Streak } from '@/types';
import { sumLoggedActionsCo2 } from '@/utils/stats';

export function earnBadge(badges: Badge[], badgeId: string): Badge[] {
  const now = new Date().toISOString();
  return badges.map((b) =>
    b.id === badgeId && !b.earned ? { ...b, earned: true, earnedDate: now } : b
  );
}

export function awardEligibleBadges(
  badges: Badge[],
  loggedActions: LoggedAction[],
  activityLogs: ActivityLog[],
  streak: Streak
): Badge[] {
  const totalSaved = sumLoggedActionsCo2(loggedActions);
  const plantMeals = activityLogs.filter(
    (a) => a.type === 'meal' && a.label.toLowerCase().includes('plant')
  ).length;
  const bikeCommutes = activityLogs.filter(
    (a) => a.type === 'commute' && a.label.toLowerCase().includes('bike')
  ).length;

  return badges.map((b) => {
    if (b.earned) return b;
    const now = new Date().toISOString();
    if (b.id === 'first-log' && activityLogs.length >= 1) return { ...b, earned: true, earnedDate: now };
    if (b.id === '7-day-streak' && streak.currentDays >= 7) return { ...b, earned: true, earnedDate: now };
    if (b.id === '30-day-streak' && streak.currentDays >= 30) return { ...b, earned: true, earnedDate: now };
    if (b.id === 'plant-meal' && plantMeals >= 10) return { ...b, earned: true, earnedDate: now };
    if (b.id === 'bike-commuter' && bikeCommutes >= 5) return { ...b, earned: true, earnedDate: now };
    if (b.id === 'ton-saved' && totalSaved >= 1000) return { ...b, earned: true, earnedDate: now };
    if (b.id === 'green-energy' && loggedActions.some((a) => a.actionId === 'green-energy')) {
      return { ...b, earned: true, earnedDate: now };
    }
    return b;
  });
}
