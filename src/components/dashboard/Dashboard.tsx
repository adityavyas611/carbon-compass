import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import { formatTonnes, getGrade, kgToTonnes, vsGlobalAverage, vsUSAverage } from '@/utils/calculations';
import { AVERAGES } from '@/utils/emissionFactors';
import FootprintChart from './FootprintChart';
import TrendLine from './TrendLine';
import InsightCard from '@/components/common/InsightCard';
import { TrendingDown, TrendingUp, Minus, Flame, Award } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_META = {
  transport: { label: 'Transport', emoji: '🚗', color: '#3a8c42', bg: 'bg-forest-100', text: 'text-forest-700' },
  energy: { label: 'Energy', emoji: '⚡', color: '#d9852a', bg: 'bg-earth-100', text: 'text-earth-700' },
  diet: { label: 'Diet', emoji: '🥗', color: '#5da863', bg: 'bg-green-100', text: 'text-green-700' },
  shopping: { label: 'Shopping', emoji: '🛍️', color: '#75a0c4', bg: 'bg-blue-100', text: 'text-blue-700' },
} as const;

export default function Dashboard() {
  const { footprint, loggedActions, streak, badges, monthlyHistory, insights, setView } = useCarbonStore();

  const totalSaved = useMemo(
    () => loggedActions.reduce((s, a) => s + a.co2SavedKg, 0),
    [loggedActions]
  );

  const grade = footprint ? getGrade(footprint.total) : null;
  const tonnes = footprint ? kgToTonnes(footprint.total) : 0;
  const earnedBadgesCount = badges.filter((b) => b.earned).length;

  if (!footprint) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-lg mx-auto" role="status">
        <h1 className="text-2xl font-bold text-forest-900 dark:text-cream mb-2">Your Dashboard</h1>
        <p className="text-sm text-sage-600 dark:text-sage-400">
          Complete the carbon assessment to see your personalised dashboard.
        </p>
      </div>
    );
  }

  const vsGlobal = vsGlobalAverage(footprint.total);
  const vsUS = vsUSAverage(footprint.total);

  const categories = [
    { key: 'transport' as const, value: footprint.transport },
    { key: 'energy' as const, value: footprint.energy },
    { key: 'diet' as const, value: footprint.diet },
    { key: 'shopping' as const, value: footprint.shopping },
  ].sort((a, b) => b.value - a.value);

  const today = format(new Date(), 'EEEE, MMM d');

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <p className="text-xs text-sage-500 font-medium dark:text-sage-400">{today}</p>
        <h1 className="text-2xl font-bold text-forest-900 dark:text-cream">Your Dashboard</h1>
      </motion.div>

      {/* Score hero */}
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
            <div className={`text-4xl font-black ${
              grade?.color === 'forest' ? 'text-forest-600' :
              grade?.color === 'sage' ? 'text-sage-600' :
              grade?.color === 'earth' ? 'text-earth-600' : 'text-red-500'
            }`}>
              {grade?.grade}
            </div>
            <p className="text-xs text-sage-500 font-medium">{grade?.label}</p>
          </div>
        </div>

        <FootprintChart footprint={footprint} />

        {/* vs averages */}
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
                <span className={`text-sm font-bold ${
                  item.val < 0 ? 'text-forest-600' : 'text-earth-600'
                }`}>
                  {item.val > 0 ? '+' : ''}{item.val.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-sage-500">{item.label}</p>
              <p className="text-xs text-sage-400">{item.ref}t avg</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-4"
      >
        <div className="card text-center py-3">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-earth-500" />
            <span className="text-xl font-bold text-forest-900">{streak.currentDays}</span>
          </div>
          <p className="text-xs text-sage-500">Day streak</p>
        </div>
        <div className="card text-center py-3">
          <div className="text-xl font-bold text-forest-900 mb-1">{formatTonnes(totalSaved)}</div>
          <p className="text-xs text-sage-500">CO₂ saved</p>
        </div>
        <div className="card text-center py-3">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="w-4 h-4 text-earth-500" />
            <span className="text-xl font-bold text-forest-900">{earnedBadgesCount}</span>
          </div>
          <p className="text-xs text-sage-500">Badges</p>
        </div>
      </motion.div>

      {/* Category breakdown */}
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

      {/* Trend line */}
      {monthlyHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-forest-800">Monthly Trend</h2>
          </div>
          <TrendLine data={monthlyHistory} />
        </motion.div>
      )}

      {/* AI Insight */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <InsightCard insight={insights[0]} />
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-forest-600 rounded-2xl p-4 text-white mt-4"
      >
        <p className="text-sm font-medium mb-1">Ready to cut your footprint?</p>
        <p className="text-xs opacity-80 mb-3">
          Your top action this week could save{' '}
          {categories[0]?.key === 'transport' ? '~420 kg' :
           categories[0]?.key === 'energy' ? '~860 kg' :
           categories[0]?.key === 'diet' ? '~180 kg' : '~120 kg'} CO₂.
        </p>
        <button
          onClick={() => setView('actions')}
          className="bg-white text-forest-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-forest-50 transition-all"
        >
          View My Action Plan →
        </button>
      </motion.div>
    </div>
  );
}
