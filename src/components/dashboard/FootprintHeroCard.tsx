import { motion } from 'framer-motion';
import type { FootprintBreakdown } from '@/types';
import { formatTonnes, getGrade, kgToTonnes, vsGlobalAverage, vsUSAverage } from '@/utils/calculations';
import { getGradeColorClass } from '@/utils/stats';
import { AVERAGES } from '@/utils/emissionFactors';
import FootprintChart from '@/components/dashboard/FootprintChart';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface FootprintHeroCardProps {
  footprint: FootprintBreakdown;
}

export default function FootprintHeroCard({ footprint }: FootprintHeroCardProps) {
  const grade = getGrade(footprint.total);
  const tonnes = kgToTonnes(footprint.total);
  const vsGlobal = vsGlobalAverage(footprint.total);
  const vsUS = vsUSAverage(footprint.total);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      className="card-elevated mb-4 overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-sage-500 dark:text-sage-400 font-medium mb-1">Annual Footprint</p>
          <div className="text-4xl font-black text-forest-900 dark:text-cream">{formatTonnes(footprint.total)}</div>
          <p className="text-sm text-sage-600 dark:text-sage-400 mt-1">CO₂e per year</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-black ${getGradeColorClass(grade.color)}`}>
            {grade.grade}
          </div>
          <p className="text-xs text-sage-500 font-medium">{grade.label}</p>
        </div>
      </div>

      <FootprintChart footprint={footprint} />

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-sage-100">
        {[
          { label: 'vs Global', val: vsGlobal, ref: AVERAGES.global },
          { label: 'vs USA', val: vsUS, ref: AVERAGES.usa },
          { label: 'vs Paris 2030', val: ((tonnes - AVERAGES.parisTarget) / AVERAGES.parisTarget) * 100, ref: AVERAGES.parisTarget },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              {item.val < -5 ? (
                <TrendingDown className="w-3 h-3 text-forest-500" />
              ) : item.val > 5 ? (
                <TrendingUp className="w-3 h-3 text-earth-500" />
              ) : (
                <Minus className="w-3 h-3 text-sage-400" />
              )}
              <span className={`text-sm font-bold ${item.val < 0 ? 'text-forest-600' : 'text-earth-600'}`}>
                {item.val > 0 ? '+' : ''}{item.val.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-sage-500">{item.label}</p>
            <p className="text-xs text-sage-400">{item.ref}t avg</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
