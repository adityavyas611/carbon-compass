import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Badge } from '@/types';

interface BadgesSectionProps {
  badges: Badge[];
}

export default function BadgesSection({ badges }: BadgesSectionProps) {
  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-forest-800 dark:text-cream">
          Badges
          <span className="ml-2 text-sage-400 font-normal">{earnedBadges.length}/{badges.length}</span>
        </h2>
        <Award className="w-4 h-4 text-earth-500" aria-hidden="true" />
      </div>

      {earnedBadges.length > 0 ? (
        <div className="mb-3">
          <p className="text-xs text-forest-600 font-medium mb-2">Earned</p>
          <div className="grid grid-cols-2 gap-2">
            {earnedBadges.map((b) => (
              <motion.div
                key={b.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card flex items-center gap-3 py-3"
              >
                <div className="text-2xl" aria-hidden="true">{b.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-forest-800 dark:text-cream">{b.title}</p>
                  <p className="text-xs text-sage-500">{b.description}</p>
                  {b.earnedDate && (
                    <p className="text-xs text-forest-500 mt-0.5">
                      {format(parseISO(b.earnedDate), 'MMM d')}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-sage-600 dark:text-sage-400 mb-3" role="status">
          No badges earned yet. Log activities and complete actions to unlock badges.
        </p>
      )}

      {unearnedBadges.length > 0 && (
        <div>
          <p className="text-xs text-sage-500 font-medium mb-2">Locked</p>
          <div className="grid grid-cols-2 gap-2">
            {unearnedBadges.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-sage-50 dark:bg-forest-800 rounded-xl opacity-60">
                <div className="text-2xl grayscale" aria-hidden="true">{b.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-sage-700 dark:text-sage-300">{b.title}</p>
                  <p className="text-xs text-sage-500">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
