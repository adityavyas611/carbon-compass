import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MonthlyData } from '@/types';
import { CHART_BAR_COLORS } from '@/constants/categoryMeta';

interface MonthlySavingsChartProps {
  monthlyHistory: MonthlyData[];
}

export default function MonthlySavingsChart({ monthlyHistory }: MonthlySavingsChartProps) {
  const chartData = monthlyHistory
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((d) => ({
      month: format(parseISO(`${d.month}-01`), 'MMM'),
      saved: Math.round(d.co2SavedKg),
    }));

  if (chartData.length === 0) {
    return (
      <div className="card mb-4" role="status">
        <p className="text-sm text-sage-600 dark:text-sage-400">
          No monthly trend data yet. Keep logging actions to build your chart.
        </p>
      </div>
    );
  }

  const chartAriaLabel = `Monthly CO₂ savings bar chart: ${chartData.map((d) => `${d.month} ${d.saved} kg`).join(', ')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card mb-4"
    >
      <h2 className="text-sm font-semibold text-forest-800 dark:text-cream mb-3">CO₂ Saved by Month (kg)</h2>
      <div className="h-36" role="img" aria-label={chartAriaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#548257' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#548257' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`${Number(v ?? 0)} kg CO₂`, 'Saved']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #dce8dc', fontSize: '12px' }}
            />
            <Bar dataKey="saved" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === chartData.length - 1 ? CHART_BAR_COLORS.active : CHART_BAR_COLORS.inactive}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
