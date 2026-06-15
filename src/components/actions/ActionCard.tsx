import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Action } from '@/types';
import { Check, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface Props {
  action: Action;
  rank?: number;
  isLoggedToday: boolean;
  isEverLogged: boolean;
  justLogged: boolean;
  onLog: (action: Action) => void;
  highlighted?: boolean;
}

const DIFFICULTY_STYLES = {
  Easy: 'bg-forest-100 text-forest-700',
  Medium: 'bg-earth-100 text-earth-700',
  'Habit Change': 'bg-purple-100 text-purple-700',
};

const CATEGORY_COLORS = {
  transport: 'bg-forest-500',
  diet: 'bg-green-500',
  energy: 'bg-earth-500',
  shopping: 'bg-blue-500',
};

export default function ActionCard({
  action,
  rank,
  isLoggedToday,
  isEverLogged,
  justLogged,
  onLog,
  highlighted = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`card transition-all ${highlighted ? 'border-forest-200' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Rank or emoji */}
        {rank ? (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${CATEGORY_COLORS[action.category]}`}>
            #{rank}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center text-lg flex-shrink-0">
            {action.icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-forest-900 leading-tight">{action.title}</h3>
            <button
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? `Collapse tips for ${action.title}` : `Expand tips for ${action.title}`}
              aria-expanded={expanded}
              className="text-sage-400 hover:text-sage-600 flex-shrink-0 mt-0.5 focus-visible:ring-2 focus-visible:ring-forest-400 rounded"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-sage-600 mb-2 leading-relaxed">{action.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {/* CO2 savings */}
            <div className="flex items-center gap-1 bg-forest-50 rounded-lg px-2 py-1">
              <Zap className="w-3 h-3 text-forest-600" />
              <span className="text-xs font-semibold text-forest-700">
                Save ~{action.co2SavedKg >= 1000 ? `${(action.co2SavedKg / 1000).toFixed(1)}t` : `${action.co2SavedKg} kg`} CO₂/yr
              </span>
            </div>

            {/* Difficulty */}
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${DIFFICULTY_STYLES[action.difficulty]}`}>
              {action.difficulty}
            </span>

            {/* Times logged */}
            {isEverLogged && (
              <span className="text-xs text-sage-400">✓ Done before</span>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-sage-100">
              <p className="text-xs font-semibold text-forest-700 mb-2">How to get started:</p>
              <ul className="space-y-1">
                {action.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-sage-600">
                    <span className="text-forest-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log button */}
      <div className="mt-3 pt-3 border-t border-sage-100">
        <button
          onClick={() => onLog(action)}
          disabled={isLoggedToday}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isLoggedToday
              ? 'bg-forest-100 text-forest-600 cursor-not-allowed'
              : justLogged
              ? 'bg-forest-500 text-white'
              : 'bg-forest-600 hover:bg-forest-700 text-white active:scale-95'
          }`}
        >
          <AnimatePresence mode="wait">
            {justLogged ? (
              <motion.span
                key="done"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Logged! 🎉
              </motion.span>
            ) : isLoggedToday ? (
              <motion.span key="today" className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Done today
              </motion.span>
            ) : (
              <motion.span key="log">I did this today</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
