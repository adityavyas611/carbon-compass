import type { TransportData, EnergyData, DietData, ShoppingData } from '@/types';

export const ASSESSMENT_STEPS = ['transport', 'energy', 'diet', 'shopping', 'results'] as const;
export type AssessmentStep = (typeof ASSESSMENT_STEPS)[number];

export const STEP_LABELS: Record<AssessmentStep, string> = {
  transport: 'Getting Around',
  energy: 'Home Energy',
  diet: 'Food & Diet',
  shopping: 'Shopping',
  results: 'Your Footprint',
};

export const DEFAULT_TRANSPORT: TransportData = {
  carType: 'petrol',
  carMilesPerWeek: 100,
  flightsShortPerYear: 2,
  flightsLongPerYear: 1,
  publicTransitDaysPerWeek: 2,
};

export const DEFAULT_ENERGY: EnergyData = {
  electricitySource: 'grid',
  heatingType: 'gas',
  homeSizeSqft: 1200,
  numPeople: 2,
};

export const DEFAULT_DIET: DietData = {
  dietType: 'omnivore',
  localFoodPercent: 20,
  foodWasteLevel: 'medium',
};

export const DEFAULT_SHOPPING: ShoppingData = {
  newClothingItemsPerMonth: 3,
  electronicsPerYear: 1,
  onlineOrdersPerWeek: 2,
  buySecondhand: false,
};
