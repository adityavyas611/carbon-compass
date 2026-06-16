import ThemeToggle from '@/components/common/ThemeToggle';
import { Leaf } from 'lucide-react';
import { STEP_LABELS, type AssessmentStep } from '@/components/onboarding/assessmentDefaults';

interface AssessmentHeaderProps {
  currentStep: AssessmentStep;
  stepIndex: number;
  totalSteps: number;
}

export default function AssessmentHeader({ currentStep, stepIndex, totalSteps }: AssessmentHeaderProps) {
  return (
    <header className="bg-white dark:bg-forest-900 border-b border-sage-200 dark:border-forest-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-forest-600 rounded-xl flex items-center justify-center" aria-hidden="true">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-forest-900 dark:text-cream">CarbonTrack</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-sm text-muted" aria-live="polite" aria-atomic="true">
          Step {stepIndex + 1} of {totalSteps}: {STEP_LABELS[currentStep]}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
