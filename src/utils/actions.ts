import type { Action, FootprintBreakdown } from '@/types';
import { ALL_ACTIONS } from '@/data/actionsCatalog';
import { sortFootprintCategories } from '@/utils/footprintCategories';

export { ALL_ACTIONS } from '@/data/actionsCatalog';

export function getTopActions(
  footprint: FootprintBreakdown,
  count = 3,
  actionPool: Action[] = ALL_ACTIONS,
): Action[] {
  const categories = sortFootprintCategories(footprint);
  const result: Action[] = [];

  for (const cat of categories) {
    if (result.length >= count) break;
    const candidates = actionPool
      .filter((a) => a.category === cat.key)
      .sort((a, b) => b.co2SavedKg - a.co2SavedKg);
    if (candidates[0]) result.push(candidates[0]);
  }

  if (result.length < count) {
    const remaining = actionPool
      .filter((a) => !result.some((r) => r.id === a.id))
      .sort((a, b) => b.co2SavedKg - a.co2SavedKg);
    result.push(...remaining.slice(0, count - result.length));
  }

  return result.slice(0, count);
}
