import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { AssessmentData, TransportData, EnergyData, DietData, ShoppingData } from '@/types';
import {
  calcTransportFootprint,
  calcEnergyFootprint,
  calcDietFootprint,
  calcShoppingFootprint,
  formatTonnes,
} from '@/utils/calculations';
import { useCarbonStore } from '@/store/carbonStore';
import TransportStep from './TransportStep';
import EnergyStep from './EnergyStep';
import DietStep from './DietStep';
import ShoppingStep from './ShoppingStep';
import ResultsStep from './ResultsStep';
import ThemeToggle from '@/components/common/ThemeToggle';
import { Leaf } from 'lucide-react';

const STEPS = ['transport', 'energy', 'diet', 'shopping', 'results'] as const;
type Step = typeof STEPS[number];

const STEP_LABELS: Record<Step, string> = {
  transport: 'Getting Around',
  energy: 'Home Energy',
  diet: 'Food & Diet',
  shopping: 'Shopping',
  results: 'Your Footprint',
};

const DEFAULT_TRANSPORT: TransportData = {
  carType: 'petrol',
  carMilesPerWeek: 100,
  flightsShortPerYear: 2,
  flightsLongPerYear: 1,
  publicTransitDaysPerWeek: 2,
};

const DEFAULT_ENERGY: EnergyData = {
  electricitySource: 'grid',
  heatingType: 'gas',
  homeSizeSqft: 1200,
  numPeople: 2,
};

const DEFAULT_DIET: DietData = {
  dietType: 'omnivore',
  localFoodPercent: 20,
  foodWasteLevel: 'medium',
};

const DEFAULT_SHOPPING: ShoppingData = {
  newClothingItemsPerMonth: 3,
  electronicsPerYear: 1,
  onlineOrdersPerWeek: 2,
  buySecondhand: false,
};

export default function AssessmentFlow() {
  const { completeAssessment } = useCarbonStore();
  const [currentStep, setCurrentStep] = useState<Step>('transport');
  const [transport, setTransport] = useState<TransportData>(DEFAULT_TRANSPORT);
  const [energy, setEnergy] = useState<EnergyData>(DEFAULT_ENERGY);
  const [diet, setDiet] = useState<DietData>(DEFAULT_DIET);
  const [shopping, setShopping] = useState<ShoppingData>(DEFAULT_SHOPPING);
  const [direction, setDirection] = useState(1);
  const prefersReduced = useReducedMotion();

  const stepIndex = STEPS.indexOf(currentStep);

  const liveEstimate = useMemo(() => ({
    transport: calcTransportFootprint(transport),
    energy: calcEnergyFootprint(energy),
    diet: calcDietFootprint(diet),
    shopping: calcShoppingFootprint(shopping),
  }), [transport, energy, diet, shopping]);

  const totalKg = useMemo(
    () => liveEstimate.transport + liveEstimate.energy + liveEstimate.diet + liveEstimate.shopping,
    [liveEstimate]
  );

  const goNext = () => {
    setDirection(1);
    setCurrentStep(STEPS[stepIndex + 1]);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(STEPS[stepIndex - 1]);
  };

  const handleFinish = () => {
    const data: AssessmentData = { transport, energy, diet, shopping };
    completeAssessment(data);
  };

  const variants = {
    enter: (d: number) => ({ x: d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 flex flex-col">
      <a
        href="#assessment-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-forest-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl"
      >
        Skip to assessment
      </a>
      {/* Header */}
      <header className="bg-white dark:bg-forest-900 border-b border-sage-200 dark:border-forest-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-forest-600 rounded-xl flex items-center justify-center" aria-hidden="true">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-forest-900 dark:text-cream">CarbonTrack</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm text-muted" aria-live="polite" aria-atomic="true">
            Step {stepIndex + 1} of {STEPS.length}: {STEP_LABELS[currentStep]}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 bg-sage-200 dark:bg-forest-800" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="Assessment progress">
        <motion.div
          className="h-full bg-forest-500"
          animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: prefersReduced ? 0 : 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Live estimate banner (hidden on results) */}
      {currentStep !== 'results' && (
        <div className="bg-forest-600 text-white px-4 py-2.5 flex items-center justify-between" aria-live="polite" aria-atomic="true">
          <span className="text-sm font-medium text-white/95">Live estimate</span>
          <span className="text-base font-bold">
            {formatTonnes(totalKg)} CO₂e / year
          </span>
        </div>
      )}

      {/* Step tabs */}
      {currentStep !== 'results' && (
        <nav aria-label="Assessment steps" className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide">
          {STEPS.filter((s) => s !== 'results').map((s, i) => (
            <button
              key={s}
              type="button"
              disabled={i > stepIndex}
              onClick={() => {
                if (i <= stepIndex) {
                  setDirection(i < stepIndex ? -1 : 1);
                  setCurrentStep(s);
                }
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
      )}

      {/* Content */}
      <main id="assessment-main" className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={prefersReduced ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } } : variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReduced ? 0 : 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            {currentStep === 'transport' && (
              <TransportStep data={transport} onChange={setTransport} onNext={goNext} />
            )}
            {currentStep === 'energy' && (
              <EnergyStep data={energy} onChange={setEnergy} onNext={goNext} onBack={goBack} />
            )}
            {currentStep === 'diet' && (
              <DietStep data={diet} onChange={setDiet} onNext={goNext} onBack={goBack} />
            )}
            {currentStep === 'shopping' && (
              <ShoppingStep
                data={shopping}
                onChange={setShopping}
                onNext={goNext}
                onBack={goBack}
              />
            )}
            {currentStep === 'results' && (
              <ResultsStep
                transport={liveEstimate.transport}
                energy={liveEstimate.energy}
                diet={liveEstimate.diet}
                shopping={liveEstimate.shopping}
                total={totalKg}
                onFinish={handleFinish}
                onBack={goBack}
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

