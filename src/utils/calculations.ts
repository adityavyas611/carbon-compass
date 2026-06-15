import type {
  AssessmentData,
  FootprintBreakdown,
  TransportData,
  EnergyData,
  DietData,
  ShoppingData,
} from '../types';
import {
  TRANSPORT_FACTORS,
  ENERGY_FACTORS,
  DIET_FACTORS,
  SHOPPING_FACTORS,
} from './emissionFactors';

export function calcTransportFootprint(t: TransportData): number {
  const carEmissions =
    t.carType !== 'none'
      ? t.carMilesPerWeek * 52 * TRANSPORT_FACTORS.car[t.carType]
      : 0;

  const flightEmissions =
    t.flightsShortPerYear * TRANSPORT_FACTORS.flight.short +
    t.flightsLongPerYear * TRANSPORT_FACTORS.flight.long;

  const transitEmissions =
    t.publicTransitDaysPerWeek *
    52 *
    TRANSPORT_FACTORS.publicTransitMilesPerDay *
    TRANSPORT_FACTORS.publicTransit;

  return carEmissions + flightEmissions + transitEmissions;
}

export function calcEnergyFootprint(e: EnergyData): number {
  const sqftPer1000 = e.homeSizeSqft / 1000;
  const perPersonFactor = 1 / Math.max(e.numPeople, 1);

  const electricityBase =
    ENERGY_FACTORS.baselineElectricity * sqftPer1000 * perPersonFactor;
  const electricityAdjusted =
    electricityBase * ENERGY_FACTORS.electricity[e.electricitySource];

  const heatingBase =
    ENERGY_FACTORS.baselineHeating * sqftPer1000 * perPersonFactor;
  // Apply per-type heating emission factor relative to the gas baseline (2.04)
  const heatingMultiplier = ENERGY_FACTORS.heating[e.heatingType] / ENERGY_FACTORS.heating.gas;
  const heatingAdjusted = heatingBase * heatingMultiplier;

  return electricityAdjusted + heatingAdjusted;
}

export function calcDietFootprint(d: DietData): number {
  const base = DIET_FACTORS.annual[d.dietType];
  const localReduction = (d.localFoodPercent / 100) * DIET_FACTORS.localDiscount;
  const wasteFactor = DIET_FACTORS.waste[d.foodWasteLevel];
  return base * (1 - localReduction) * wasteFactor;
}

export function calcShoppingFootprint(s: ShoppingData): number {
  const clothingCost =
    s.newClothingItemsPerMonth *
    12 *
    SHOPPING_FACTORS.clothing *
    (s.buySecondhand ? 1 - SHOPPING_FACTORS.secondhandDiscount : 1);

  const electronicsCost = s.electronicsPerYear * SHOPPING_FACTORS.electronics;

  const onlineCost = s.onlineOrdersPerWeek * 52 * SHOPPING_FACTORS.onlineOrder;

  return clothingCost + electronicsCost + onlineCost;
}

export function calcFullFootprint(data: AssessmentData): FootprintBreakdown {
  const transport = calcTransportFootprint(data.transport);
  const energy = calcEnergyFootprint(data.energy);
  const diet = calcDietFootprint(data.diet);
  const shopping = calcShoppingFootprint(data.shopping);
  return {
    transport,
    energy,
    diet,
    shopping,
    total: transport + energy + diet + shopping,
  };
}

export function kgToTonnes(kg: number): number {
  return kg / 1000;
}

export function formatTonnes(kg: number): string {
  const t = kgToTonnes(kg);
  if (t < 0.1) return `${Math.round(kg)} kg`;
  return `${t.toFixed(1)}t`;
}

export function getGrade(totalKg: number): { grade: string; color: string; label: string } {
  const tonnes = kgToTonnes(totalKg);
  if (tonnes < 2) return { grade: 'A+', color: 'forest', label: 'Carbon Champion' };
  if (tonnes < 4) return { grade: 'A', color: 'forest', label: 'Climate Leader' };
  if (tonnes < 6) return { grade: 'B', color: 'sage', label: 'Doing Great' };
  if (tonnes < 8) return { grade: 'C', color: 'earth', label: 'Room to Improve' };
  if (tonnes < 12) return { grade: 'D', color: 'orange', label: 'Needs Attention' };
  return { grade: 'F', color: 'red', label: 'Take Action Now' };
}

export function vsGlobalAverage(totalKg: number): number {
  const tonnes = kgToTonnes(totalKg);
  return ((tonnes - 4.8) / 4.8) * 100;
}

export function vsUSAverage(totalKg: number): number {
  const tonnes = kgToTonnes(totalKg);
  return ((tonnes - 14.5) / 14.5) * 100;
}
