import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyData } from '@/types';
import { format, parseISO } from 'date-fns';

interface Props {
  data: MonthlyData[];
}

interface TooltipPayloadEntry {
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-sage-500 dark:text-sage-400 text-xs mb-1">{label}</p>
        <p className="font-semibold text-forest-800 dark:text-cream">
          {((payload[0].value ?? 0) / 1000).toFixed(2)}t CO₂e
        </p>
        {payload[1] && (
          <p className="text-forest-500 dark:text-forest-300 text-xs">{payload[1].value.toFixed(0)} kg saved</p>
        )}
      </div>
    );
  }
  return null;
};

export default function TrendLine({ data }: Props) {
  const chartData = data
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((d) => ({
      ...d,
      label: format(parseISO(`${d.month}-01`), 'MMM'),
    }));

  const ariaLabel = chartData.length > 0
    ? `Monthly carbon footprint trend: ${chartData.map((d) => `${d.label} ${(d.footprintKg / 1000).toFixed(2)} tonnes`).join(', ')}`
    : 'No monthly footprint trend data yet';

  return (
    <div className="h-32" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="footprintGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3a8c42" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3a8c42" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5da863" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#5da863" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#548257' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#548257' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="footprintKg"
            name="Footprint (kg)"
            stroke="#3a8c42"
            strokeWidth={2}
            fill="url(#footprintGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
