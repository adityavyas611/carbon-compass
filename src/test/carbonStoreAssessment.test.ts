import { describe, it, expect } from 'vitest';
import { useCarbonStore } from '@/store/carbonStore';
import { SAMPLE_ASSESSMENT } from '@/test/fixtures';
import { setupCarbonStoreTests, store } from '@/test/helpers/carbonStoreTestUtils';

setupCarbonStoreTests();

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
    store().completeAssessment(SAMPLE_ASSESSMENT);
    expect(store().monthlyHistory).toHaveLength(1);
    expect(store().monthlyHistory[0].footprintKg).toBe(firstTotal);
  });

  it('preserves history entries for other months when updating current month', () => {
    const today = new Date().toISOString().slice(0, 7);
    useCarbonStore.setState({
      monthlyHistory: [
        { month: '2020-01', footprintKg: 9000, actionsCompleted: 2, co2SavedKg: 100 },
        { month: today, footprintKg: 5000, actionsCompleted: 0, co2SavedKg: 0 },
      ],
    });
    store().completeAssessment(SAMPLE_ASSESSMENT);
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
