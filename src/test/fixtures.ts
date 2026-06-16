import type { AssessmentData, FootprintBreakdown, TransportData } from '@/types';

export const SAMPLE_FOOTPRINT: FootprintBreakdown = {
  transport: 1000,
  energy: 500,
  diet: 800,
  shopping: 300,
  total: 2600,
};

export const LARGE_FOOTPRINT: FootprintBreakdown = {
  transport: 3000,
  energy: 2000,
  diet: 1500,
  shopping: 500,
  total: 7000,
};

export const DEFAULT_TRANSPORT: TransportData = {
  carType: 'petrol',
  carMilesPerWeek: 100,
  flightsShortPerYear: 2,
  flightsLongPerYear: 1,
  publicTransitDaysPerWeek: 2,
};

export function makeFootprint(overrides: Partial<FootprintBreakdown> = {}): FootprintBreakdown {
  return { ...SAMPLE_FOOTPRINT, ...overrides };
}

export const SAMPLE_ASSESSMENT: AssessmentData = {
  transport: { carType: 'petrol', carMilesPerWeek: 100, flightsShortPerYear: 1, flightsLongPerYear: 0, publicTransitDaysPerWeek: 0 },
  energy: { electricitySource: 'grid', heatingType: 'gas', homeSizeSqft: 1200, numPeople: 2 },
  diet: { dietType: 'omnivore', localFoodPercent: 20, foodWasteLevel: 'medium' },
  shopping: { newClothingItemsPerMonth: 2, electronicsPerYear: 1, onlineOrdersPerWeek: 2, buySecondhand: false },
};
