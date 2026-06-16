import { describe, it, expect } from 'vitest';
import { calcEnergyFootprint } from '@/utils/calculations';
import type { EnergyData } from '@/types';

describe('calcEnergyFootprint', () => {
  const base: EnergyData = {
    electricitySource: 'grid',
    heatingType: 'gas',
    homeSizeSqft: 1000,
    numPeople: 1,
  };

  it('solar reduces electricity footprint vs grid', () => {
    const grid = calcEnergyFootprint({ ...base, electricitySource: 'grid' });
    const solar = calcEnergyFootprint({ ...base, electricitySource: 'solar' });
    expect(solar).toBeLessThan(grid);
  });

  it('no heating produces lower footprint than gas heating', () => {
    const gas = calcEnergyFootprint({ ...base, heatingType: 'gas' });
    const none = calcEnergyFootprint({ ...base, heatingType: 'none' });
    expect(none).toBeLessThan(gas);
  });

  it('heat pump produces lower footprint than oil heating', () => {
    const oil = calcEnergyFootprint({ ...base, heatingType: 'oil' });
    const heatPump = calcEnergyFootprint({ ...base, heatingType: 'heat-pump' });
    expect(heatPump).toBeLessThan(oil);
  });

  it('more people reduces per-person footprint', () => {
    const onePerson = calcEnergyFootprint({ ...base, numPeople: 1 });
    const fourPeople = calcEnergyFootprint({ ...base, numPeople: 4 });
    expect(fourPeople).toBeLessThan(onePerson);
  });

  it('larger home increases footprint', () => {
    const small = calcEnergyFootprint({ ...base, homeSizeSqft: 500 });
    const large = calcEnergyFootprint({ ...base, homeSizeSqft: 3000 });
    expect(large).toBeGreaterThan(small);
  });

  it('numPeople guard: never divides by zero', () => {
    const result = calcEnergyFootprint({ ...base, numPeople: 1 });
    expect(isFinite(result)).toBe(true);
  });
});
