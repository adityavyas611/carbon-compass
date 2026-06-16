import { describe, it, expect } from 'vitest';
import { ENERGY_FACTORS } from '@/utils/emissionFactors';

describe('ENERGY_FACTORS', () => {
  it('has factors for all electricity sources', () => {
    expect(ENERGY_FACTORS.electricity).toHaveProperty('grid');
    expect(ENERGY_FACTORS.electricity).toHaveProperty('mixed');
    expect(ENERGY_FACTORS.electricity).toHaveProperty('renewable');
    expect(ENERGY_FACTORS.electricity).toHaveProperty('solar');
  });

  it('has factors for all heating types', () => {
    expect(ENERGY_FACTORS.heating).toHaveProperty('gas');
    expect(ENERGY_FACTORS.heating).toHaveProperty('oil');
    expect(ENERGY_FACTORS.heating).toHaveProperty('electric');
    expect(ENERGY_FACTORS.heating).toHaveProperty('heat-pump');
    expect(ENERGY_FACTORS.heating).toHaveProperty('none');
  });

  it('solar electricity has lowest factor', () => {
    const { grid, mixed, renewable, solar } = ENERGY_FACTORS.electricity;
    expect(solar).toBeLessThan(renewable);
    expect(renewable).toBeLessThan(mixed);
    expect(mixed).toBeLessThan(grid);
  });

  it('none heating has zero factor', () => {
    expect(ENERGY_FACTORS.heating.none).toBe(0);
  });

  it('heat-pump has lower factor than oil', () => {
    expect(ENERGY_FACTORS.heating['heat-pump']).toBeLessThan(ENERGY_FACTORS.heating.oil);
  });

  it('baseline values are positive', () => {
    expect(ENERGY_FACTORS.baselineElectricity).toBeGreaterThan(0);
    expect(ENERGY_FACTORS.baselineHeating).toBeGreaterThan(0);
  });
});
