import { motion } from 'framer-motion';
import { formatTonnes, getGrade, kgToTonnes } from '@/utils/calculations';
import { AVERAGES } from '@/utils/emissionFactors';

interface Props {
  total: number;
}

export default function ResultsScoreHeader({ total }: Props) {
  const grade = getGrade(total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      <div className="inline-flex items-center gap-2 bg-forest-100 dark:bg-forest-800 text-forest-700 dark:text-forest-200 rounded-full px-3 py-1 text-sm font-medium mb-4">
        Your Carbon Footprint
      </div>

      <motion.div
        className={`text-6xl font-black mb-1 ${
          grade.color === 'forest' ? 'text-forest-600' :
          grade.color === 'sage' ? 'text-sage-600' :
          grade.color === 'earth' ? 'text-earth-600' : 'text-red-500'
        }`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        {formatTonnes(total)}
      </motion.div>
      <p className="text-sage-700 dark:text-sage-300 text-sm">CO₂e per year</p>

      <div className="mt-3 inline-flex items-center gap-2 bg-white dark:bg-forest-900 border border-sage-200 dark:border-forest-700 rounded-xl px-4 py-2">
        <span
          className={`text-2xl font-black ${
            grade.color === 'forest' ? 'text-forest-600' :
            grade.color === 'sage' ? 'text-sage-600' :
            grade.color === 'earth' ? 'text-earth-600' : 'text-red-500'
          }`}
        >
          {grade.grade}
        </span>
        <span className="text-sm text-forest-800 dark:text-cream font-medium">{grade.label}</span>
      </div>
    </motion.div>
  );
}

export function ResultsComparisonCard({ total }: Props) {
  const tonnes = kgToTonnes(total);
  const vsGlobal = ((tonnes - AVERAGES.global) / AVERAGES.global) * 100;
  const vsUS = ((tonnes - AVERAGES.usa) / AVERAGES.usa) * 100;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card mb-5"
      >
        <h3 className="text-sm font-semibold text-forest-800 mb-3">How you compare</h3>
        <div className="space-y-3">
          {[
            { label: 'Global average', val: AVERAGES.global, diff: vsGlobal },
            { label: 'US average', val: AVERAGES.usa, diff: vsUS },
            { label: 'Paris 2030 target', val: AVERAGES.parisTarget, diff: ((tonnes - AVERAGES.parisTarget) / AVERAGES.parisTarget) * 100 },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-sage-700">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-forest-900">{row.val}t</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    row.diff < 0 ? 'bg-forest-100 text-forest-700' : 'bg-earth-100 text-earth-700'
                  }`}
                >
                  {row.diff > 0 ? '+' : ''}
                  {row.diff.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-forest-50 border border-forest-200 rounded-2xl p-4 mb-6"
      >
        <p className="text-sm text-forest-700">
          {tonnes < AVERAGES.global
            ? `You're already below the global average. Your dashboard will show personalized actions to go even further.`
            : `Your dashboard shows exactly where your biggest wins are — and the good news is, a few changes can make a huge difference.`}
        </p>
      </motion.div>
    </>
  );
}
