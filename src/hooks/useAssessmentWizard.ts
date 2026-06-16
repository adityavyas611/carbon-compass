import { useState, useMemo, useCallback } from 'react';
import type { AssessmentData, TransportData, EnergyData, DietData, ShoppingData } from '@/types';
import {
  calcTransportFootprint,
  calcEnergyFootprint,
  calcDietFootprint,
  calcShoppingFootprint,
} from '@/utils/calculations';
import { useCarbonStore } from '@/store/carbonStore';
import {
  ASSESSMENT_STEPS,
  type AssessmentStep,
  DEFAULT_TRANSPORT,
  DEFAULT_ENERGY,
  DEFAULT_DIET,
  DEFAULT_SHOPPING,
} from '@/components/onboarding/assessmentDefaults';

export function useAssessmentWizard() {
  const { completeAssessment } = useCarbonStore();
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('transport');
  const [transport, setTransport] = useState<TransportData>(DEFAULT_TRANSPORT);
  const [energy, setEnergy] = useState<EnergyData>(DEFAULT_ENERGY);
  const [diet, setDiet] = useState<DietData>(DEFAULT_DIET);
  const [shopping, setShopping] = useState<ShoppingData>(DEFAULT_SHOPPING);
  const [direction, setDirection] = useState(1);

  const stepIndex = ASSESSMENT_STEPS.indexOf(currentStep);

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

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep(ASSESSMENT_STEPS[stepIndex + 1]);
  }, [stepIndex]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep(ASSESSMENT_STEPS[stepIndex - 1]);
  }, [stepIndex]);

  const goToStep = useCallback((step: AssessmentStep, dir: number) => {
    setDirection(dir);
    setCurrentStep(step);
  }, []);

  const handleFinish = useCallback(() => {
    const data: AssessmentData = { transport, energy, diet, shopping };
    completeAssessment(data);
  }, [transport, energy, diet, shopping, completeAssessment]);

  return {
    currentStep,
    stepIndex,
    transport,
    energy,
    diet,
    shopping,
    direction,
    liveEstimate,
    totalKg,
    setTransport,
    setEnergy,
    setDiet,
    setShopping,
    goNext,
    goBack,
    goToStep,
    handleFinish,
  };
}
