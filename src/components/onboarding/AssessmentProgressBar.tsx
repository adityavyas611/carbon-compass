import { motion } from 'framer-motion';

interface AssessmentProgressBarProps {
  stepIndex: number;
  totalSteps: number;
  prefersReducedMotion: boolean;
}

export default function AssessmentProgressBar({
  stepIndex,
  totalSteps,
  prefersReducedMotion,
}: AssessmentProgressBarProps) {
  return (
    <div
      className="h-1.5 bg-sage-200 dark:bg-forest-800"
      role="progressbar"
      aria-valuenow={stepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label="Assessment progress"
    >
      <motion.div
        className="h-full bg-forest-500"
        animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}
