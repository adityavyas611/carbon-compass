import { describe, it, expect } from 'vitest';
import { sortFootprintCategories, getBiggestCategoryKey, footprintToChartData } from '@/utils/footprintCategories';
import { SAMPLE_FOOTPRINT } from '@/test/fixtures';

describe('footprintCategories', () => {
  it('sorts categories by descending impact', () => {
    const sorted = sortFootprintCategories(SAMPLE_FOOTPRINT);
    expect(sorted[0]?.key).toBe('transport');
    expect(sorted.at(-1)?.key).toBe('shopping');
  });

  it('returns the highest-impact category key', () => {
    expect(getBiggestCategoryKey(SAMPLE_FOOTPRINT)).toBe('transport');
  });

  it('builds chart data with colors and non-zero values only', () => {
    const data = footprintToChartData(SAMPLE_FOOTPRINT);
    expect(data.every((d) => d.value > 0)).toBe(true);
    expect(data[0]).toMatchObject({ name: 'Transport', fill: '#3a8c42' });
  });
});
