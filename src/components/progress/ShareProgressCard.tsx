import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { formatTonnes } from '@/utils/calculations';

interface ShareProgressCardProps {
  totalSaved: number;
  earnedBadgeCount: number;
  gradeLabel: string;
  copyStatus: string;
  onCopy: () => void;
}

export default function ShareProgressCard({
  totalSaved,
  earnedBadgeCount,
  gradeLabel,
  copyStatus,
  onCopy,
}: ShareProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-forest-600 rounded-2xl p-4 text-white"
    >
      <div className="flex items-start gap-3">
        <Share2 className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold mb-1">Share your progress</p>
          <p className="text-xs opacity-80 mb-3">
            Inspire others! You've saved {formatTonnes(totalSaved)} CO₂ and earned {earnedBadgeCount} badges.
          </p>
          <button
            onClick={onCopy}
            className="bg-white text-forest-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-forest-50 transition-all focus-visible:ring-2 focus-visible:ring-white"
          >
            Copy milestone text
          </button>
          {copyStatus && (
            <p className="text-xs mt-2 opacity-90" role="status" aria-live="polite">
              {copyStatus}
            </p>
          )}
          <span className="sr-only">Grade: {gradeLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}
