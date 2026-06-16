import type { FootprintBreakdown } from '@/types';
import { CATEGORY_META, FOOTPRINT_CATEGORY_KEYS, type FootprintCategoryKey } from '@/constants/categoryMeta';

export interface SortedFootprintCategory {
  key: FootprintCategoryKey;
  value: number;
}

export function sortFootprintCategories(footprint: FootprintBreakdown): SortedFootprintCategory[] {
  return FOOTPRINT_CATEGORY_KEYS.map((key) => ({ key, value: footprint[key] })).sort(
    (a, b) => b.value - a.value
  );
}

export function getBiggestCategoryKey(footprint: FootprintBreakdown): FootprintCategoryKey {
  return sortFootprintCategories(footprint)[0]?.key ?? 'transport';
}

export function footprintToChartData(footprint: FootprintBreakdown) {
  return FOOTPRINT_CATEGORY_KEYS.map((key) => ({
    name: CATEGORY_META[key].label,
    value: Math.round(footprint[key]),
    fill: CATEGORY_META[key].color,
  })).filter((d) => d.value > 0);
}

export function footprintToCategoryRows(footprint: FootprintBreakdown) {
  return FOOTPRINT_CATEGORY_KEYS.map((key) => ({
    key,
    label: CATEGORY_META[key].label,
    value: footprint[key],
    color: CATEGORY_META[key].color,
    emoji: CATEGORY_META[key].emoji,
  })).sort((a, b) => b.value - a.value);
}
