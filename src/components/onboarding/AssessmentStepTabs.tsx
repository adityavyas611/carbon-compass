import { ASSESSMENT_STEPS, STEP_LABELS, type AssessmentStep } from '@/components/onboarding/assessmentDefaults';

interface AssessmentStepTabsProps {
  currentStep: AssessmentStep;
  stepIndex: number;
  onSelectStep: (step: AssessmentStep, direction: number) => void;
}

export default function AssessmentStepTabs({
  currentStep,
  stepIndex,
  onSelectStep,
}: AssessmentStepTabsProps) {
  return (
    <nav aria-label="Assessment steps" className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide">
      {ASSESSMENT_STEPS.filter((s) => s !== 'results').map((s, i) => (
        <button
          key={s}
          type="button"
          disabled={i > stepIndex}
          onClick={() => {
            if (i <= stepIndex) onSelectStep(s, i < stepIndex ? -1 : 1);
          }}
          aria-current={s === currentStep ? 'step' : undefined}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-forest-400 ${
            s === currentStep
              ? 'bg-forest-600 text-white'
              : i < stepIndex
              ? 'bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-200'
              : 'bg-sage-200 text-sage-700 dark:bg-forest-800 dark:text-sage-400 cursor-default'
          }`}
        >
          {STEP_LABELS[s]}
        </button>
      ))}
    </nav>
  );
}
