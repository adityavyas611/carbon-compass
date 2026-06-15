import { describe, it, expect, beforeEach } from 'vitest';
import { useCarbonStore } from '@/store/carbonStore';
import type { AssessmentData } from '@/types';

const SAMPLE_ASSESSMENT: AssessmentData = {
  transport: { carType: 'petrol', carMilesPerWeek: 100, flightsShortPerYear: 1, flightsLongPerYear: 0, publicTransitDaysPerWeek: 0 },
  energy: { electricitySource: 'grid', heatingType: 'gas', homeSizeSqft: 1200, numPeople: 2 },
  diet: { dietType: 'omnivore', localFoodPercent: 20, foodWasteLevel: 'medium' },
  shopping: { newClothingItemsPerMonth: 2, electronicsPerYear: 1, onlineOrdersPerWeek: 2, buySecondhand: false },
};

const store = () => useCarbonStore.getState();

beforeEach(() => {
  store().resetAll();
});

// ── Initial State ───────────────────────────────────────────

describe('initial state', () => {
  it('starts with onboarding incomplete', () => {
    expect(store().hasCompletedOnboarding).toBe(false);
  });

  it('has no footprint data', () => {
    expect(store().footprint).toBeNull();
    expect(store().assessment).toBeNull();
  });

  it('starts on the onboarding view', () => {
    expect(store().currentView).toBe('onboarding');
  });

  it('has empty logged actions and activity logs', () => {
    expect(store().loggedActions).toHaveLength(0);
    expect(store().activityLogs).toHaveLength(0);
  });

  it('has zero streak', () => {
    expect(store().streak.currentDays).toBe(0);
    expect(store().streak.longestDays).toBe(0);
    expect(store().streak.lastLogDate).toBeNull();
  });

  it('has 10 unearned badges', () => {
    const { badges } = store();
    expect(badges.length).toBe(10);
    expect(badges.every((b) => !b.earned)).toBe(true);
  });

  it('has no weekly report', () => {
    expect(store().weeklyReport).toBeNull();
  });

  it('has no insights', () => {
    expect(store().insights).toHaveLength(0);
  });
});

// ── setView ─────────────────────────────────────────────────

describe('setView', () => {
  it('changes the current view', () => {
    store().setView('dashboard');
    expect(store().currentView).toBe('dashboard');
  });

  it('can switch to all views', () => {
    const views = ['dashboard', 'actions', 'tracker', 'progress'] as const;
    for (const view of views) {
      store().setView(view);
      expect(store().currentView).toBe(view);
    }
  });
});

// ── completeAssessment ──────────────────────────────────────

describe('completeAssessment', () => {
  it('sets hasCompletedOnboarding to true', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    expect(store().hasCompletedOnboarding).toBe(true);
  });

  it('stores the assessment data', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    expect(store().assessment).toEqual(SAMPLE_ASSESSMENT);
  });

  it('calculates and stores the footprint', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    const fp = store().footprint;
    expect(fp).not.toBeNull();
    if (!fp) throw new Error('expected footprint after assessment');
    expect(fp.total).toBeGreaterThan(0);
    expect(fp.total).toBeCloseTo(fp.transport + fp.energy + fp.diet + fp.shopping, 5);
  });

  it('switches view to dashboard', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    expect(store().currentView).toBe('dashboard');
  });

  it('earns the assessment-done badge', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    const badge = store().badges.find((b) => b.id === 'assessment-done');
    expect(badge?.earned).toBe(true);
    expect(badge?.earnedDate).toBeDefined();
  });

  it('creates a monthly history entry for the current month', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    expect(store().monthlyHistory).toHaveLength(1);
    expect(store().monthlyHistory[0].footprintKg).toBeGreaterThan(0);
  });

  it('updates existing monthly entry instead of creating a duplicate', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    const firstTotal = store().monthlyHistory[0].footprintKg;

    // Re-complete with same month — should update, not add
    store().completeAssessment(SAMPLE_ASSESSMENT);
    expect(store().monthlyHistory).toHaveLength(1);
    expect(store().monthlyHistory[0].footprintKg).toBe(firstTotal);
  });

  it('preserves history entries for other months when updating current month (ELSE branch)', () => {
    // Seed with a past month AND a current month entry
    const today = new Date().toISOString().slice(0, 7); // yyyy-MM
    useCarbonStore.setState({
      monthlyHistory: [
        { month: '2020-01', footprintKg: 9000, actionsCompleted: 2, co2SavedKg: 100 },
        { month: today, footprintKg: 5000, actionsCompleted: 0, co2SavedKg: 0 },
      ],
    });
    store().completeAssessment(SAMPLE_ASSESSMENT);
    // Past month entry must pass through the ELSE branch unchanged
    const pastEntry = store().monthlyHistory.find((m) => m.month === '2020-01');
    expect(pastEntry).toBeDefined();
    if (!pastEntry) throw new Error('expected past month entry');
    expect(pastEntry.footprintKg).toBe(9000);
    expect(pastEntry.actionsCompleted).toBe(2);
  });

  it('rejects invalid assessment data', () => {
    const invalid = {
      ...SAMPLE_ASSESSMENT,
      transport: { ...SAMPLE_ASSESSMENT.transport, carMilesPerWeek: -1 },
    };
    store().completeAssessment(invalid);
    expect(store().hasCompletedOnboarding).toBe(false);
  });
});

// ── setWeeklyReport ─────────────────────────────────────────

describe('setWeeklyReport', () => {
  it('stores the weekly report', () => {
    store().setWeeklyReport('Great week!');
    expect(store().weeklyReport).toBe('Great week!');
  });
});

// ── addInsight ──────────────────────────────────────────────

describe('addInsight', () => {
  it('prepends insights to the array', () => {
    store().addInsight('first');
    store().addInsight('second');
    expect(store().insights[0]).toBe('second');
    expect(store().insights[1]).toBe('first');
  });

  it('caps insights at 10 items', () => {
    for (let i = 0; i < 15; i++) {
      store().addInsight(`insight-${i}`);
    }
    expect(store().insights).toHaveLength(10);
    // Most recent should be first
    expect(store().insights[0]).toBe('insight-14');
  });
});

// ── logAction ───────────────────────────────────────────────

describe('logAction', () => {
  beforeEach(() => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
  });

  it('adds to loggedActions', () => {
    store().logAction('plant-meal-3x', 180);
    expect(store().loggedActions).toHaveLength(1);
    expect(store().loggedActions[0].actionId).toBe('plant-meal-3x');
    expect(store().loggedActions[0].co2SavedKg).toBe(180);
  });

  it('updates the existing monthly co2SavedKg', () => {
    const before = store().monthlyHistory[0].co2SavedKg;
    store().logAction('plant-meal-3x', 100);
    const after = store().monthlyHistory[0].co2SavedKg;
    expect(after).toBe(before + 100);
  });

  it('increments actionsCompleted in monthly history', () => {
    const before = store().monthlyHistory[0].actionsCompleted;
    store().logAction('plant-meal-3x', 100);
    expect(store().monthlyHistory[0].actionsCompleted).toBe(before + 1);
  });

  it('creates a new monthly entry when none exists for this month', () => {
    // Reset so monthly history is empty, then log without completing assessment first
    store().resetAll();
    store().logAction('plant-meal-3x', 100);
    // A new month entry should have been pushed
    expect(store().monthlyHistory).toHaveLength(1);
    expect(store().monthlyHistory[0].co2SavedKg).toBe(100);
    expect(store().monthlyHistory[0].actionsCompleted).toBe(1);
  });

  it('preserves history entries for other months (ELSE branch in month map)', () => {
    // Seed history with a past month entry
    useCarbonStore.setState({
      monthlyHistory: [
        { month: '2020-01', footprintKg: 8000, actionsCompleted: 0, co2SavedKg: 0 },
      ],
    });
    store().logAction('plant-meal-3x', 50);
    const pastEntry = store().monthlyHistory.find((m) => m.month === '2020-01');
    // Past month entry must be unchanged (ELSE branch)
    expect(pastEntry).toBeDefined();
    if (!pastEntry) throw new Error('expected past month entry');
    expect(pastEntry.co2SavedKg).toBe(0);
    expect(pastEntry.actionsCompleted).toBe(0);
  });

  it('rejects unknown action IDs', () => {
    const before = store().loggedActions.length;
    store().logAction('nonexistent-action', 100);
    expect(store().loggedActions).toHaveLength(before);
  });

  it('rejects negative co2SavedKg', () => {
    const before = store().loggedActions.length;
    store().logAction('plant-meal-3x', -10);
    expect(store().loggedActions).toHaveLength(before);
  });
});

// ── getTotalSaved ───────────────────────────────────────────

describe('getTotalSaved', () => {
  it('returns 0 when no actions logged', () => {
    expect(store().getTotalSaved()).toBe(0);
  });

  it('returns sum of all logged action savings', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    store().logAction('plant-meal-3x', 100);
    store().logAction('cut-beef', 250);
    expect(store().getTotalSaved()).toBe(350);
  });
});

// ── logActivity & streak ────────────────────────────────────

describe('logActivity — streak tracking', () => {
  const activity = {
    date: new Date().toISOString().slice(0, 10),
    type: 'meal' as const,
    label: 'Plant-based meal',
    co2Kg: -0.5,
  };

  it('adds to activityLogs', () => {
    store().logActivity(activity);
    expect(store().activityLogs).toHaveLength(1);
  });

  it('rejects invalid activity input', () => {
    store().logActivity({ ...activity, label: '' });
    expect(store().activityLogs).toHaveLength(0);
  });

  it('assigns a unique id to each log entry', () => {
    store().logActivity(activity);
    store().logActivity(activity);
    const ids = store().activityLogs.map((l) => l.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('starts streak at 1 on first log', () => {
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(1);
    expect(store().streak.longestDays).toBe(1);
  });

  it('does not increment streak for same-day duplicate logs', () => {
    store().logActivity(activity);
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(1);
  });

  it('increments streak when logging on the next consecutive day', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    // Manually set streak.lastLogDate to yesterday to simulate prior day log
    useCarbonStore.setState({
      streak: { currentDays: 1, longestDays: 1, lastLogDate: yesterday },
    });
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(2);
    expect(store().streak.longestDays).toBe(2);
  });

  it('resets streak to 1 when logging after a gap', () => {
    // Set last log to 3 days ago (non-consecutive)
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    useCarbonStore.setState({
      streak: { currentDays: 5, longestDays: 10, lastLogDate: threeDaysAgo },
    });
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(1);
    // longestDays should be preserved
    expect(store().streak.longestDays).toBe(10);
  });

  it('updates longestDays when new streak exceeds it', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    useCarbonStore.setState({
      streak: { currentDays: 6, longestDays: 6, lastLogDate: yesterday },
    });
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(7);
    expect(store().streak.longestDays).toBe(7);
  });

  it('earns first-log badge on first activity', () => {
    store().logActivity(activity);
    const badge = store().badges.find((b) => b.id === 'first-log');
    expect(badge?.earned).toBe(true);
  });

  it('does not re-earn first-log badge on subsequent logs', () => {
    store().logActivity(activity);
    const beforeDate = store().badges.find((b) => b.id === 'first-log')?.earnedDate;
    store().logActivity(activity);
    const afterDate = store().badges.find((b) => b.id === 'first-log')?.earnedDate;
    expect(afterDate).toBe(beforeDate);
  });
});

// ── checkAndAwardBadges ─────────────────────────────────────

describe('checkAndAwardBadges', () => {
  it('awards 7-day-streak badge when streak >= 7', () => {
    useCarbonStore.setState({ streak: { currentDays: 7, longestDays: 7, lastLogDate: null } });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === '7-day-streak')?.earned).toBe(true);
  });

  it('does not award 7-day-streak badge below threshold', () => {
    useCarbonStore.setState({ streak: { currentDays: 6, longestDays: 6, lastLogDate: null } });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === '7-day-streak')?.earned).toBe(false);
  });

  it('awards 30-day-streak badge when streak >= 30', () => {
    useCarbonStore.setState({ streak: { currentDays: 30, longestDays: 30, lastLogDate: null } });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === '30-day-streak')?.earned).toBe(true);
  });

  it('awards plant-meal badge after 10 plant-based meals', () => {
    const plantLogs = Array.from({ length: 10 }, (_, i) => ({
      id: `log-${i}`,
      date: '2024-01-01',
      type: 'meal' as const,
      label: 'Plant-based meal',
      co2Kg: -0.5,
    }));
    useCarbonStore.setState({ activityLogs: plantLogs });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'plant-meal')?.earned).toBe(true);
  });

  it('does not award plant-meal badge with fewer than 10', () => {
    const plantLogs = Array.from({ length: 9 }, (_, i) => ({
      id: `log-${i}`,
      date: '2024-01-01',
      type: 'meal' as const,
      label: 'Plant-based meal',
      co2Kg: -0.5,
    }));
    useCarbonStore.setState({ activityLogs: plantLogs });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'plant-meal')?.earned).toBe(false);
  });

  it('awards bike-commuter badge after 5 bike commutes', () => {
    const bikeLogs = Array.from({ length: 5 }, (_, i) => ({
      id: `log-${i}`,
      date: '2024-01-01',
      type: 'commute' as const,
      label: 'Biked / Walked',
      co2Kg: 0,
    }));
    useCarbonStore.setState({ activityLogs: bikeLogs });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'bike-commuter')?.earned).toBe(true);
  });

  it('awards ton-saved badge when total saved >= 1000 kg', () => {
    useCarbonStore.setState({
      loggedActions: [{ actionId: 'ev-switch', date: '2024-01-01', co2SavedKg: 1000 }],
    });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'ton-saved')?.earned).toBe(true);
  });

  it('does not award ton-saved below 1000 kg', () => {
    useCarbonStore.setState({
      loggedActions: [{ actionId: 'led-bulbs', date: '2024-01-01', co2SavedKg: 999 }],
    });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'ton-saved')?.earned).toBe(false);
  });

  it('awards green-energy badge when green-energy action is logged', () => {
    useCarbonStore.setState({
      loggedActions: [{ actionId: 'green-energy', date: '2024-01-01', co2SavedKg: 860 }],
    });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'green-energy')?.earned).toBe(true);
  });

  it('does not re-award already-earned badges', () => {
    // Pre-earn the badge
    useCarbonStore.setState({
      badges: useCarbonStore.getState().badges.map((b) =>
        b.id === '7-day-streak'
          ? { ...b, earned: true, earnedDate: '2024-01-01T00:00:00.000Z' }
          : b
      ),
      streak: { currentDays: 7, longestDays: 7, lastLogDate: null },
    });
    store().checkAndAwardBadges();
    // earnedDate should still be the original one, not updated
    const badge = store().badges.find((b) => b.id === '7-day-streak');
    expect(badge?.earnedDate).toBe('2024-01-01T00:00:00.000Z');
  });
});

// ── resetAll ────────────────────────────────────────────────

describe('resetAll', () => {
  it('clears all data and returns to initial state', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    store().logAction('plant-meal-3x', 100);
    store().setWeeklyReport('weekly summary');
    store().addInsight('some insight');

    store().resetAll();

    expect(store().hasCompletedOnboarding).toBe(false);
    expect(store().footprint).toBeNull();
    expect(store().assessment).toBeNull();
    expect(store().loggedActions).toHaveLength(0);
    expect(store().activityLogs).toHaveLength(0);
    expect(store().insights).toHaveLength(0);
    expect(store().weeklyReport).toBeNull();
    expect(store().monthlyHistory).toHaveLength(0);
    expect(store().currentView).toBe('onboarding');
    expect(store().streak.currentDays).toBe(0);
    expect(store().badges.every((b) => !b.earned)).toBe(true);
  });
});

// ── aiInsights utility ──────────────────────────────────────
// Tests moved to aiInsights.test.ts to keep this file focused on store logic
