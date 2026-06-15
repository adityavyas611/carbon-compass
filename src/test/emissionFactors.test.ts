import { describe, it, expect } from 'vitest';
import {
  TRANSPORT_FACTORS,
  ENERGY_FACTORS,
  DIET_FACTORS,
  SHOPPING_FACTORS,
  AVERAGES,
} from '@/utils/emissionFactors';

describe('TRANSPORT_FACTORS', () => {
  it('has factors for all car types', () => {
    expect(TRANSPORT_FACTORS.car).toHaveProperty('petrol');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('diesel');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('hybrid');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('electric');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('none');
  });

  it('none car type has zero emissions', () => {
    expect(TRANSPORT_FACTORS.car.none).toBe(0);
  });

  it('electric car emits less than petrol per mile', () => {
    expect(TRANSPORT_FACTORS.car.electric).toBeLessThan(TRANSPORT_FACTORS.car.petrol);
  });

  it('hybrid emits less than diesel per mile', () => {
    expect(TRANSPORT_FACTORS.car.hybrid).toBeLessThan(TRANSPORT_FACTORS.car.diesel);
  });

  it('long flights emit more than short flights', () => {
    expect(TRANSPORT_FACTORS.flight.long).toBeGreaterThan(TRANSPORT_FACTORS.flight.short);
  });

  it('public transit factor is positive', () => {
    expect(TRANSPORT_FACTORS.publicTransit).toBeGreaterThan(0);
    expect(TRANSPORT_FACTORS.publicTransitMilesPerDay).toBeGreaterThan(0);
  });
});

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

describe('DIET_FACTORS', () => {
  it('has annual factors for all diet types', () => {
    const types = ['vegan', 'vegetarian', 'pescatarian', 'flexitarian', 'omnivore', 'heavy-meat'];
    for (const t of types) {
      expect(DIET_FACTORS.annual).toHaveProperty(t);
      expect(DIET_FACTORS.annual[t as keyof typeof DIET_FACTORS.annual]).toBeGreaterThan(0);
    }
  });

  it('vegan has lowest annual footprint', () => {
    const { vegan, vegetarian, pescatarian, flexitarian, omnivore } = DIET_FACTORS.annual;
    expect(vegan).toBeLessThan(vegetarian);
    expect(vegetarian).toBeLessThan(pescatarian);
    expect(pescatarian).toBeLessThan(flexitarian);
    expect(flexitarian).toBeLessThan(omnivore);
  });

  it('heavy-meat has highest annual footprint', () => {
    const values = Object.values(DIET_FACTORS.annual);
    expect(DIET_FACTORS.annual['heavy-meat']).toBe(Math.max(...values));
  });

  it('local discount is between 0 and 1', () => {
    expect(DIET_FACTORS.localDiscount).toBeGreaterThan(0);
    expect(DIET_FACTORS.localDiscount).toBeLessThan(1);
  });

  it('high waste multiplier is greater than low', () => {
    expect(DIET_FACTORS.waste.high).toBeGreaterThan(DIET_FACTORS.waste.low);
  });

  it('medium waste is between low and high', () => {
    expect(DIET_FACTORS.waste.medium).toBeGreaterThan(DIET_FACTORS.waste.low);
    expect(DIET_FACTORS.waste.medium).toBeLessThan(DIET_FACTORS.waste.high);
  });
});

describe('SHOPPING_FACTORS', () => {
  it('all factors are positive', () => {
    expect(SHOPPING_FACTORS.clothing).toBeGreaterThan(0);
    expect(SHOPPING_FACTORS.electronics).toBeGreaterThan(0);
    expect(SHOPPING_FACTORS.onlineOrder).toBeGreaterThan(0);
  });

  it('secondhand discount is between 0 and 1', () => {
    expect(SHOPPING_FACTORS.secondhandDiscount).toBeGreaterThan(0);
    expect(SHOPPING_FACTORS.secondhandDiscount).toBeLessThan(1);
  });

  it('electronics factor is larger than clothing factor', () => {
    expect(SHOPPING_FACTORS.electronics).toBeGreaterThan(SHOPPING_FACTORS.clothing);
  });
});

describe('AVERAGES', () => {
  it('all country averages are positive', () => {
    expect(AVERAGES.global).toBeGreaterThan(0);
    expect(AVERAGES.usa).toBeGreaterThan(0);
    expect(AVERAGES.uk).toBeGreaterThan(0);
    expect(AVERAGES.eu).toBeGreaterThan(0);
    expect(AVERAGES.india).toBeGreaterThan(0);
  });

  it('US average is higher than global average', () => {
    expect(AVERAGES.usa).toBeGreaterThan(AVERAGES.global);
  });

  it('Paris target is lower than global average', () => {
    expect(AVERAGES.parisTarget).toBeLessThan(AVERAGES.global);
  });

  it('India average is below global average', () => {
    expect(AVERAGES.india).toBeLessThan(AVERAGES.global);
  });
});
