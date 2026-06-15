import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import { ALL_ACTIONS, getTopActions } from '@/utils/actions';
import type { Action, ActionCategory } from '@/types';
import ActionCard from './ActionCard';
import { Sparkles, Filter } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const CATEGORY_FILTERS: { key: ActionCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '✨' },
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'diet', label: 'Diet', emoji: '🥗' },
  { key: 'energy', label: 'Energy', emoji: '⚡' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️' },
];

export default function ActionHub() {
  const { footprint, loggedActions, logAction } = useCarbonStore();
  const [activeFilter, setActiveFilter] = useState<ActionCategory | 'all'>('all');
  const [justLogged, setJustLogged] = useState<string | null>(null);

  const topActions = useMemo(() => footprint ? getTopActions(footprint) : [], [footprint]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const loggedToday = new Set(loggedActions.filter((a) => a.date === today).map((a) => a.actionId));
  const allLoggedIds = new Set(loggedActions.map((a) => a.actionId));

  const filteredActions = activeFilter === 'all'
    ? ALL_ACTIONS
    : ALL_ACTIONS.filter((a) => a.category === activeFilter);

  const handleLog = (action: Action) => {
    if (!loggedToday.has(action.id)) {
      logAction(action.id, action.co2SavedKg);
      setJustLogged(action.id);
      setTimeout(() => setJustLogged(null), 2000);
    }
  };

  const totalSavedThisWeek = useMemo(() => {
    const weekAgo = startOfDay(subDays(new Date(today), 7));
    return loggedActions
      .filter((a) => new Date(a.date) >= weekAgo)
      .reduce((s, a) => s + a.co2SavedKg, 0);
  }, [loggedActions, today]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-bold text-forest-900 mb-0.5">Action Hub</h1>
        <p className="text-sm text-sage-600">
          {totalSavedThisWeek > 0
            ? `You've saved ${Math.round(totalSavedThisWeek)} kg CO₂ this week. Keep going!`
            : 'Log actions to track your real-world impact.'}
        </p>
      </motion.div>

      {/* Top 3 This Week */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-earth-500" />
          <h2 className="text-sm font-semibold text-forest-800">Your Top 3 This Week</h2>
          <span className="text-xs text-sage-400 ml-auto">Based on your footprint</span>
        </div>
        {topActions.length === 0 ? (
        <div className="space-y-3" role="status" aria-label="No personalised actions available">
          <p className="text-sm text-sage-600 dark:text-sage-400">
            Complete your assessment to see personalised top actions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topActions.map((action, i) => (
            <ActionCard
              key={action.id}
              action={action}
              rank={i + 1}
              isLoggedToday={loggedToday.has(action.id)}
              isEverLogged={allLoggedIds.has(action.id)}
              justLogged={justLogged === action.id}
              onLog={handleLog}
              highlighted
            />
          ))}
        </div>
      )}
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4"
      >
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            aria-pressed={activeFilter === f.key}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-forest-400 ${
              activeFilter === f.key
                ? 'bg-forest-600 text-white'
                : 'bg-white border border-sage-200 text-sage-600 hover:border-sage-300'
            }`}
          >
            <span>{f.emoji}</span> {f.label}
          </button>
        ))}
      </motion.div>

      {/* All Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-forest-800">
            All Actions
            <span className="ml-2 text-sage-400 font-normal">({filteredActions.length})</span>
          </h2>
          <Filter className="w-4 h-4 text-sage-400" />
        </div>
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filteredActions.map((action) => (
              <motion.div
                key={action.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <ActionCard
                  action={action}
                  isLoggedToday={loggedToday.has(action.id)}
                  isEverLogged={allLoggedIds.has(action.id)}
                  justLogged={justLogged === action.id}
                  onLog={handleLog}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
