import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import { sumLoggedActionsCo2 } from '@/utils/stats';
import { getBiggestCategoryKey } from '@/utils/footprintCategories';
import FootprintHeroCard from '@/components/dashboard/FootprintHeroCard';
import DashboardQuickStats from '@/components/dashboard/DashboardQuickStats';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import DashboardActionCta from '@/components/dashboard/DashboardActionCta';
import TrendLine from '@/components/dashboard/TrendLine';
import InsightCard from '@/components/common/InsightCard';
import { format } from 'date-fns';

export default function Dashboard() {
  const { footprint, loggedActions, streak, badges, monthlyHistory, insights, setView } = useCarbonStore();

  const totalSaved = useMemo(() => sumLoggedActionsCo2(loggedActions), [loggedActions]);
  const earnedBadgesCount = badges.filter((b) => b.earned).length;
  const today = format(new Date(), 'EEEE, MMM d');

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

  const topCategory = getBiggestCategoryKey(footprint);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <p className="text-xs text-sage-500 font-medium dark:text-sage-400">{today}</p>
        <h1 className="text-2xl font-bold text-forest-900 dark:text-cream">Your Dashboard</h1>
      </motion.div>

      <FootprintHeroCard footprint={footprint} />

      <DashboardQuickStats
        streakDays={streak.currentDays}
        totalSaved={totalSaved}
        earnedBadgesCount={earnedBadgesCount}
      />

      <CategoryBreakdown footprint={footprint} />

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

      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <InsightCard insight={insights[0]} />
        </motion.div>
      )}

      <DashboardActionCta topCategory={topCategory} onViewActions={() => setView('actions')} />
    </div>
  );
}
