import type { FootprintBreakdown, TransportData } from '@/types';

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
