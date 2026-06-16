import { motion } from 'framer-motion';

interface SavingsPerspectiveCardProps {
  totalSaved: number;
}

export default function SavingsPerspectiveCard({ totalSaved }: SavingsPerspectiveCardProps) {
  const treesEquivalent = Math.round(totalSaved / 21);
  const milesEquivalent = Math.round(totalSaved / 0.356);

  if (totalSaved <= 0) {
    return (
      <div className="card mb-4" role="status">
        <p className="text-sm text-sage-600 dark:text-sage-400">
          Log actions in the Action Hub to see your savings in real-world terms.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card mb-4"
    >
      <h2 className="text-sm font-semibold text-forest-800 dark:text-cream mb-3">Your savings in perspective</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-forest-50 dark:bg-forest-800 rounded-xl p-3">
          <div className="text-2xl mb-1">🌳</div>
          <div className="text-xl font-bold text-forest-700 dark:text-forest-300">{treesEquivalent}</div>
          <p className="text-xs text-sage-600">trees worth of CO₂ absorbed per year</p>
        </div>
        <div className="bg-earth-50 dark:bg-earth-900/30 rounded-xl p-3">
          <div className="text-2xl mb-1">🚗</div>
          <div className="text-xl font-bold text-earth-700 dark:text-earth-300">{milesEquivalent.toLocaleString()}</div>
          <p className="text-xs text-sage-600">miles not driven in a petrol car</p>
        </div>
      </div>
    </motion.div>
  );
}
