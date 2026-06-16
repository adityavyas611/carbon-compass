import { describe, it, expect } from 'vitest';
import { awardEligibleBadges, earnBadge } from '@/services/badgeService';
import type { Badge, LoggedAction, ActivityLog, Streak } from '@/types';

const baseBadge = (id: string): Badge => ({
  id,
  title: id,
  description: '',
  icon: '🏅',
  earned: false,
  category: 'general',
});

const baseStreak: Streak = { currentDays: 0, longestDays: 0, lastLogDate: null };

describe('earnBadge', () => {
  it('marks a badge as earned', () => {
    const badges = [baseBadge('assessment-done')];
    const updated = earnBadge(badges, 'assessment-done');
    expect(updated[0]?.earned).toBe(true);
    expect(updated[0]?.earnedDate).toBeDefined();
  });
});

describe('awardEligibleBadges', () => {
  it('awards first-log after an activity is logged', () => {
    const badges = [baseBadge('first-log')];
    const logs: ActivityLog[] = [{
      id: '1', date: '2026-01-01', type: 'meal', label: 'Salad', co2Kg: 0.5,
    }];
    const updated = awardEligibleBadges(badges, [], logs, baseStreak);
    expect(updated[0]?.earned).toBe(true);
  });

  it('awards 7-day streak badge', () => {
    const badges = [baseBadge('7-day-streak')];
    const updated = awardEligibleBadges(badges, [], [], { ...baseStreak, currentDays: 7 });
    expect(updated[0]?.earned).toBe(true);
  });

  it('does not re-award already earned badges', () => {
    const badges = [{ ...baseBadge('7-day-streak'), earned: true, earnedDate: '2026-01-01' }];
    const updated = awardEligibleBadges(badges, [], [], { ...baseStreak, currentDays: 7 });
    expect(updated[0]?.earnedDate).toBe('2026-01-01');
  });

  it('awards ton-saved when total savings reach 1000 kg', () => {
    const badges = [baseBadge('ton-saved')];
    const actions: LoggedAction[] = [{ actionId: 'a', date: '2026-01-01', co2SavedKg: 1000 }];
    const updated = awardEligibleBadges(badges, actions, [], baseStreak);
    expect(updated[0]?.earned).toBe(true);
  });

  it('awards plant-meal after 10 plant-based meal logs', () => {
    const badges = [baseBadge('plant-meal')];
    const logs: ActivityLog[] = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      date: '2026-01-01',
      type: 'meal',
      label: 'Plant-based meal',
      co2Kg: -0.5,
    }));
    const updated = awardEligibleBadges(badges, [], logs, baseStreak);
    expect(updated[0]?.earned).toBe(true);
  });
});
