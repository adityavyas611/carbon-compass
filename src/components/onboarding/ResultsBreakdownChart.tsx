import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatTonnes } from '@/utils/calculations';
import { footprintToCategoryRows, footprintToChartData } from '@/utils/footprintCategories';

interface Props {
  transport: number;
  energy: number;
  diet: number;
  shopping: number;
  total: number;
}

export default function ResultsBreakdownChart({ transport, energy, diet, shopping, total }: Props) {
  const footprint = { transport, energy, diet, shopping, total };
  const pieData = footprintToChartData(footprint).map((d) => ({
    name: d.name,
    value: d.value,
    color: d.fill,
  }));
  const categories = footprintToCategoryRows(footprint);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="card mb-5"
    >
      <h3 className="text-sm font-semibold text-forest-800 dark:text-cream mb-3">Footprint breakdown</h3>
      <div className="flex items-center gap-4">
        <div
          className="w-32 h-32 flex-shrink-0"
          role="img"
          aria-label={`Footprint breakdown pie chart: ${pieData.map((d) => `${d.name} ${d.value} kg`).join(', ')}`}
        >
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
  );
}
