import type { FootprintCategoryKey } from '@/constants/categoryMeta';

/** Approximate top-action savings shown on the dashboard CTA. */
export const TOP_CATEGORY_ACTION_SAVINGS: Record<FootprintCategoryKey, string> = {
  transport: '~420 kg',
  energy: '~860 kg',
  diet: '~180 kg',
  shopping: '~120 kg',
};
