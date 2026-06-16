import { motion } from 'framer-motion';
import type { FootprintCategoryKey } from '@/constants/categoryMeta';
import { TOP_CATEGORY_ACTION_SAVINGS } from '@/constants/actionSavings';

interface DashboardActionCtaProps {
  topCategory: FootprintCategoryKey;
  onViewActions: () => void;
}

export default function DashboardActionCta({ topCategory, onViewActions }: DashboardActionCtaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-forest-600 rounded-2xl p-4 text-white mt-4"
    >
      <p className="text-sm font-medium mb-1">Ready to cut your footprint?</p>
      <p className="text-xs opacity-80 mb-3">
        Your top action this week could save {TOP_CATEGORY_ACTION_SAVINGS[topCategory]} CO₂.
      </p>
      <button
        onClick={onViewActions}
        className="bg-white text-forest-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-forest-50 transition-all"
      >
        View My Action Plan →
      </button>
    </motion.div>
  );
}
