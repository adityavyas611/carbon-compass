import { describe, it, expect } from 'vitest';
import { setupCarbonStoreTests, store } from '@/test/helpers/carbonStoreTestUtils';

setupCarbonStoreTests();

describe('setWeeklyReport', () => {
  it('stores the weekly report', () => {
    store().setWeeklyReport('Great week!');
    expect(store().weeklyReport).toBe('Great week!');
  });
});

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
    expect(store().insights[0]).toBe('insight-14');
  });
});
