import { motion } from 'framer-motion';
import type { FootprintBreakdown } from '@/types';
import { formatTonnes } from '@/utils/calculations';
import { CATEGORY_META } from '@/constants/categoryMeta';
import { sortFootprintCategories } from '@/utils/footprintCategories';

interface CategoryBreakdownProps {
  footprint: FootprintBreakdown;
}

export default function CategoryBreakdown({ footprint }: CategoryBreakdownProps) {
  const categories = sortFootprintCategories(footprint);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-forest-800">By Category</h2>
        <span className="text-xs text-sage-500">Sorted by impact</span>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat.key];
          const pct = (cat.value / footprint.total) * 100;
          return (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{meta.emoji}</span>
                  <span className="text-sm font-medium text-forest-800">{meta.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-sage-600">{formatTonnes(cat.value)}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: meta.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
