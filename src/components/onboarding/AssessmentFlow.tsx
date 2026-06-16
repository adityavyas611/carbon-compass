import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAssessmentWizard } from '@/hooks/useAssessmentWizard';
import { ASSESSMENT_STEPS } from '@/components/onboarding/assessmentDefaults';
import AssessmentHeader from '@/components/onboarding/AssessmentHeader';
import AssessmentProgressBar from '@/components/onboarding/AssessmentProgressBar';
import LiveEstimateBanner from '@/components/onboarding/LiveEstimateBanner';
import AssessmentStepTabs from '@/components/onboarding/AssessmentStepTabs';
import TransportStep from '@/components/onboarding/TransportStep';
import EnergyStep from '@/components/onboarding/EnergyStep';
import DietStep from '@/components/onboarding/DietStep';
import ShoppingStep from '@/components/onboarding/ShoppingStep';
import ResultsStep from '@/components/onboarding/ResultsStep';

const slideVariants = {
  enter: (d: number) => ({ x: d * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * -40, opacity: 0 }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function AssessmentFlow() {
  const prefersReduced = useReducedMotion();
  const wizard = useAssessmentWizard();

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 flex flex-col">
      <a
        href="#assessment-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-forest-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl"
      >
        Skip to assessment
      </a>

      <AssessmentHeader
        currentStep={wizard.currentStep}
        stepIndex={wizard.stepIndex}
        totalSteps={ASSESSMENT_STEPS.length}
      />

      <AssessmentProgressBar
        stepIndex={wizard.stepIndex}
        totalSteps={ASSESSMENT_STEPS.length}
        prefersReducedMotion={prefersReduced ?? false}
      />

      {wizard.currentStep !== 'results' && <LiveEstimateBanner totalKg={wizard.totalKg} />}

      {wizard.currentStep !== 'results' && (
        <AssessmentStepTabs
          currentStep={wizard.currentStep}
          stepIndex={wizard.stepIndex}
          onSelectStep={wizard.goToStep}
        />
      )}

      <main id="assessment-main" className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={wizard.direction}>
          <motion.div
            key={wizard.currentStep}
            custom={wizard.direction}
            variants={prefersReduced ? fadeVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReduced ? 0 : 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            {wizard.currentStep === 'transport' && (
              <TransportStep data={wizard.transport} onChange={wizard.setTransport} onNext={wizard.goNext} />
            )}
            {wizard.currentStep === 'energy' && (
              <EnergyStep data={wizard.energy} onChange={wizard.setEnergy} onNext={wizard.goNext} onBack={wizard.goBack} />
            )}
            {wizard.currentStep === 'diet' && (
              <DietStep data={wizard.diet} onChange={wizard.setDiet} onNext={wizard.goNext} onBack={wizard.goBack} />
            )}
            {wizard.currentStep === 'shopping' && (
              <ShoppingStep data={wizard.shopping} onChange={wizard.setShopping} onNext={wizard.goNext} onBack={wizard.goBack} />
            )}
            {wizard.currentStep === 'results' && (
              <ResultsStep
                transport={wizard.liveEstimate.transport}
                energy={wizard.liveEstimate.energy}
                diet={wizard.liveEstimate.diet}
                shopping={wizard.liveEstimate.shopping}
                total={wizard.totalKg}
                onFinish={wizard.handleFinish}
                onBack={wizard.goBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="pb-6 text-center text-xs text-muted px-4">
        CarbonTrack — measure, understand, reduce.
      </footer>
    </div>
  );
}
