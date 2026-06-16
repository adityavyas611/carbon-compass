import { motion } from 'framer-motion';
import { Flame, Award } from 'lucide-react';
import { formatTonnes } from '@/utils/calculations';

interface DashboardQuickStatsProps {
  streakDays: number;
  totalSaved: number;
  earnedBadgesCount: number;
}

export default function DashboardQuickStats({
  streakDays,
  totalSaved,
  earnedBadgesCount,
}: DashboardQuickStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-3 gap-3 mb-4"
    >
      <div className="card text-center py-3">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Flame className="w-4 h-4 text-earth-500" />
          <span className="text-xl font-bold text-forest-900">{streakDays}</span>
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
  );
}
