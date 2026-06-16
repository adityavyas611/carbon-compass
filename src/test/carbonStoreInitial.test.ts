import { describe, it, expect } from 'vitest';
import { SAMPLE_ASSESSMENT } from '@/test/fixtures';
import { setupCarbonStoreTests, store } from '@/test/helpers/carbonStoreTestUtils';

setupCarbonStoreTests();

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

  it('has 8 unearned badges', () => {
    const { badges } = store();
    expect(badges.length).toBe(8);
    expect(badges.every((b) => !b.earned)).toBe(true);
  });

  it('has no weekly report', () => {
    expect(store().weeklyReport).toBeNull();
  });

  it('has no insights', () => {
    expect(store().insights).toHaveLength(0);
  });
});

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
