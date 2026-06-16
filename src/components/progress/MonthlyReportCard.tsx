import { motion } from 'framer-motion';
import type { FootprintBreakdown } from '@/types';
import type { Streak } from '@/types';
import { formatTonnes, getGrade, kgToTonnes } from '@/utils/calculations';
import { getGradeColorClass } from '@/utils/stats';
import { AVERAGES } from '@/utils/emissionFactors';
import { format } from 'date-fns';

interface MonthlyReportCardProps {
  footprint: FootprintBreakdown | null;
  totalSaved: number;
  streak: Streak;
}

export default function MonthlyReportCard({ footprint, totalSaved, streak }: MonthlyReportCardProps) {
  const grade = footprint ? getGrade(footprint.total) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      className="card-elevated mb-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-forest-50 dark:bg-forest-800 rounded-full -translate-y-12 translate-x-12" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-sage-500 font-medium mb-1">Monthly Carbon Report</p>
            <p className="text-sm text-sage-700 dark:text-sage-300">{format(new Date(), 'MMMM yyyy')}</p>
          </div>
          <div className={`text-5xl font-black ${getGradeColorClass(grade?.color)}`}>
            {grade?.grade ?? '—'}
          </div>
        </div>

        {footprint ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-sage-50 dark:bg-forest-800 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-forest-900 dark:text-cream">{formatTonnes(footprint.total)}</div>
                <p className="text-xs text-sage-500">Annual</p>
              </div>
              <div className="bg-forest-50 dark:bg-forest-800 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-forest-700 dark:text-forest-300">{formatTonnes(totalSaved)}</div>
                <p className="text-xs text-sage-500">Saved</p>
              </div>
              <div className="bg-earth-50 dark:bg-earth-900/30 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-earth-700 dark:text-earth-300">{streak.currentDays}</div>
                <p className="text-xs text-sage-500">Day streak</p>
              </div>
            </div>

            <div className="bg-forest-50 dark:bg-forest-800 rounded-xl p-3 text-sm text-forest-700 dark:text-forest-200">
              {grade?.color === 'forest'
                ? `You're ${Math.abs(((kgToTonnes(footprint.total) - AVERAGES.global) / AVERAGES.global) * 100).toFixed(0)}% below the global average. You're an inspiration.`
                : `You're ${((kgToTonnes(footprint.total) - AVERAGES.global) / AVERAGES.global * 100).toFixed(0)}% above the global average. Small changes this month can move your grade up.`
              }
            </div>
          </>
        ) : (
          <p className="text-sm text-sage-600 dark:text-sage-400" role="status">
            Complete your assessment to see your monthly carbon report.
          </p>
        )}
      </div>
    </motion.div>
  );
}
