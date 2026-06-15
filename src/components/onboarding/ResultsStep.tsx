import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatTonnes, getGrade, kgToTonnes } from '@/utils/calculations';
import { AVERAGES } from '@/utils/emissionFactors';
import { ArrowRight, ChevronLeft } from 'lucide-react';

interface Props {
  transport: number;
  energy: number;
  diet: number;
  shopping: number;
  total: number;
  onFinish: () => void;
  onBack: () => void;
}

const CATEGORY_COLORS = {
  transport: '#3a8c42',
  energy: '#d9852a',
  diet: '#5da863',
  shopping: '#75a0c4',
};


export default function ResultsStep({ transport, energy, diet, shopping, total, onFinish, onBack }: Props) {
  const grade = getGrade(total);
  const tonnes = kgToTonnes(total);
  const vsGlobal = ((tonnes - AVERAGES.global) / AVERAGES.global) * 100;
  const vsUS = ((tonnes - AVERAGES.usa) / AVERAGES.usa) * 100;

  const pieData = [
    { name: 'Transport', value: Math.round(transport), color: CATEGORY_COLORS.transport },
    { name: 'Energy', value: Math.round(energy), color: CATEGORY_COLORS.energy },
    { name: 'Diet', value: Math.round(diet), color: CATEGORY_COLORS.diet },
    { name: 'Shopping', value: Math.round(shopping), color: CATEGORY_COLORS.shopping },
  ].filter(d => d.value > 0);

  const categories = [
    { key: 'transport', label: 'Transport', value: transport, color: CATEGORY_COLORS.transport, emoji: '🚗' },
    { key: 'energy', label: 'Energy', value: energy, color: CATEGORY_COLORS.energy, emoji: '⚡' },
    { key: 'diet', label: 'Diet', value: diet, color: CATEGORY_COLORS.diet, emoji: '🥗' },
    { key: 'shopping', label: 'Shopping', value: shopping, color: CATEGORY_COLORS.shopping, emoji: '🛍️' },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto pb-24">
      <h1 className="sr-only">Your Carbon Footprint Results</h1>
      {/* Score header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 rounded-full px-3 py-1 text-sm font-medium mb-4">
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
        <p className="text-sage-600 text-sm">CO₂e per year</p>

        <div className="mt-3 inline-flex items-center gap-2 bg-white border border-sage-200 rounded-xl px-4 py-2">
          <span className={`text-2xl font-black ${
            grade.color === 'forest' ? 'text-forest-600' :
            grade.color === 'sage' ? 'text-sage-600' :
            grade.color === 'earth' ? 'text-earth-600' : 'text-red-500'
          }`}>{grade.grade}</span>
          <span className="text-sm text-forest-800 font-medium">{grade.label}</span>
        </div>
      </motion.div>

      {/* Pie chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card mb-5"
      >
        <h3 className="text-sm font-semibold text-forest-800 mb-3">Footprint breakdown</h3>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 flex-shrink-0" role="img" aria-label={`Footprint breakdown pie chart: ${pieData.map((d) => `${d.name} ${d.value} kg`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={56} dataKey="value" strokeWidth={2} stroke="#faf9f7">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${Math.round(Number(v ?? 0))} kg`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {categories.map((cat) => (
              <div key={cat.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-forest-800">{cat.emoji} {cat.label}</span>
                  <span className="text-sage-600">{formatTonnes(cat.value)}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(cat.value / total) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Comparison */}
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
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  row.diff < 0 ? 'bg-forest-100 text-forest-700' : 'bg-earth-100 text-earth-700'
                }`}>
                  {row.diff > 0 ? '+' : ''}{row.diff.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-forest-50 border border-forest-200 rounded-2xl p-4 mb-6"
      >
        <p className="text-sm text-forest-700">
          {tonnes < AVERAGES.global
            ? `You're already below the global average. Your dashboard will show personalized actions to go even further.`
            : `Your dashboard shows exactly where your biggest wins are — and the good news is, a few changes can make a huge difference.`
          }
        </p>
      </motion.div>

      <div className="flex gap-3">
        <button onClick={onBack} aria-label="Go back to shopping" className="btn-outline flex items-center gap-2 py-3.5 px-4">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <button onClick={onFinish} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
          See My Action Plan <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
