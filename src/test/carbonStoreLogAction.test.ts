import { describe, it, expect, beforeEach } from 'vitest';
import { useCarbonStore } from '@/store/carbonStore';
import { SAMPLE_ASSESSMENT } from '@/test/fixtures';
import { setupCarbonStoreTests, store } from '@/test/helpers/carbonStoreTestUtils';

setupCarbonStoreTests();

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
    expect(store().monthlyHistory[0].co2SavedKg).toBe(before + 100);
  });

  it('increments actionsCompleted in monthly history', () => {
    const before = store().monthlyHistory[0].actionsCompleted;
    store().logAction('plant-meal-3x', 100);
    expect(store().monthlyHistory[0].actionsCompleted).toBe(before + 1);
  });

  it('creates a new monthly entry when none exists for this month', () => {
    store().resetAll();
    store().logAction('plant-meal-3x', 100);
    expect(store().monthlyHistory).toHaveLength(1);
    expect(store().monthlyHistory[0].co2SavedKg).toBe(100);
    expect(store().monthlyHistory[0].actionsCompleted).toBe(1);
  });

  it('preserves history entries for other months', () => {
    useCarbonStore.setState({
      monthlyHistory: [{ month: '2020-01', footprintKg: 8000, actionsCompleted: 0, co2SavedKg: 0 }],
    });
    store().logAction('plant-meal-3x', 50);
    const pastEntry = store().monthlyHistory.find((m) => m.month === '2020-01');
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

describe('logged action savings', () => {
  it('returns 0 when no actions logged', () => {
    expect(store().loggedActions).toHaveLength(0);
  });

  it('accumulates savings through logAction', () => {
    store().completeAssessment(SAMPLE_ASSESSMENT);
    store().logAction('plant-meal-3x', 100);
    store().logAction('cut-beef', 250);
    const total = store().loggedActions.reduce((s, a) => s + a.co2SavedKg, 0);
    expect(total).toBe(350);
  });
});
