import {
  ResponsiveContainer,
  Cell,
  Tooltip,
  PieChart,
  Pie,
} from 'recharts';
import type { FootprintBreakdown } from '@/types';
import { formatTonnes } from '@/utils/calculations';

interface Props {
  footprint: FootprintBreakdown;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

const CHART_DATA = (fp: FootprintBreakdown) => [
  { name: 'Transport', value: Math.round(fp.transport), fill: '#3a8c42' },
  { name: 'Energy', value: Math.round(fp.energy), fill: '#d9852a' },
  { name: 'Diet', value: Math.round(fp.diet), fill: '#5da863' },
  { name: 'Shopping', value: Math.round(fp.shopping), fill: '#75a0c4' },
];

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <span className="font-semibold text-forest-800 dark:text-cream">{payload[0].name}</span>
        <span className="ml-2 text-sage-600 dark:text-sage-400">{formatTonnes(payload[0].value)}</span>
      </div>
    );
  }
  return null;
};

export default function FootprintChart({ footprint }: Props) {
  const data = CHART_DATA(footprint).filter((d) => d.value > 0);

  const ariaLabel = data.length > 0
    ? `Carbon footprint breakdown pie chart: ${data.map((d) => `${d.name} ${formatTonnes(d.value)}`).join(', ')}`
    : 'No footprint breakdown data';

  return (
    <div className="h-40" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={68}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
