import { describe, it, expect } from 'vitest';
import {
  TransportSchema,
  EnergySchema,
  DietSchema,
  ShoppingSchema,
  AssessmentSchema,
  ActivityLogInputSchema,
  LogActionSchema,
} from '@/lib/schemas';

// ── TransportSchema ─────────────────────────────────────────

describe('TransportSchema', () => {
  const valid = {
    carType: 'petrol',
    carMilesPerWeek: 100,
    flightsShortPerYear: 2,
    flightsLongPerYear: 1,
    publicTransitDaysPerWeek: 3,
  };

  it('accepts a valid transport object', () => {
    expect(TransportSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid car type', () => {
    expect(TransportSchema.safeParse({ ...valid, carType: 'helicopter' }).success).toBe(false);
  });

  it('rejects negative miles', () => {
    expect(TransportSchema.safeParse({ ...valid, carMilesPerWeek: -5 }).success).toBe(false);
  });

  it('rejects transit days above 7', () => {
    expect(TransportSchema.safeParse({ ...valid, publicTransitDaysPerWeek: 8 }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    const { carType: _carType, ...noCarType } = valid;
    expect(TransportSchema.safeParse(noCarType).success).toBe(false);
  });
});

// ── EnergySchema ────────────────────────────────────────────

describe('EnergySchema', () => {
  const valid = {
    electricitySource: 'grid',
    heatingType: 'gas',
    homeSizeSqft: 1500,
    numPeople: 2,
  };

  it('accepts a valid energy object', () => {
    expect(EnergySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid electricity source', () => {
    expect(EnergySchema.safeParse({ ...valid, electricitySource: 'nuclear' }).success).toBe(false);
  });

  it('rejects zero people', () => {
    expect(EnergySchema.safeParse({ ...valid, numPeople: 0 }).success).toBe(false);
  });

  it('rejects home size below minimum', () => {
    expect(EnergySchema.safeParse({ ...valid, homeSizeSqft: 50 }).success).toBe(false);
  });
});

// ── DietSchema ──────────────────────────────────────────────

describe('DietSchema', () => {
  const valid = { dietType: 'omnivore', localFoodPercent: 30, foodWasteLevel: 'medium' };

  it('accepts a valid diet object', () => {
    expect(DietSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects unknown diet type', () => {
    expect(DietSchema.safeParse({ ...valid, dietType: 'keto' }).success).toBe(false);
  });

  it('rejects localFoodPercent above 100', () => {
    expect(DietSchema.safeParse({ ...valid, localFoodPercent: 110 }).success).toBe(false);
  });

  it('rejects localFoodPercent below 0', () => {
    expect(DietSchema.safeParse({ ...valid, localFoodPercent: -1 }).success).toBe(false);
  });
});

// ── ShoppingSchema ──────────────────────────────────────────

describe('ShoppingSchema', () => {
  const valid = {
    newClothingItemsPerMonth: 3,
    electronicsPerYear: 1,
    onlineOrdersPerWeek: 2,
    buySecondhand: false,
  };

  it('accepts a valid shopping object', () => {
    expect(ShoppingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects negative clothing items', () => {
    expect(ShoppingSchema.safeParse({ ...valid, newClothingItemsPerMonth: -1 }).success).toBe(false);
  });

  it('rejects non-boolean buySecondhand', () => {
    expect(ShoppingSchema.safeParse({ ...valid, buySecondhand: 'yes' }).success).toBe(false);
  });
});

// ── AssessmentSchema ────────────────────────────────────────

describe('AssessmentSchema', () => {
  it('accepts a fully valid assessment', () => {
    const result = AssessmentSchema.safeParse({
      transport: { carType: 'electric', carMilesPerWeek: 80, flightsShortPerYear: 1, flightsLongPerYear: 0, publicTransitDaysPerWeek: 2 },
      energy: { electricitySource: 'renewable', heatingType: 'heat-pump', homeSizeSqft: 1200, numPeople: 3 },
      diet: { dietType: 'vegan', localFoodPercent: 50, foodWasteLevel: 'low' },
      shopping: { newClothingItemsPerMonth: 1, electronicsPerYear: 0, onlineOrdersPerWeek: 1, buySecondhand: true },
    });
    expect(result.success).toBe(true);
  });

  it('rejects when any sub-section is invalid', () => {
    const result = AssessmentSchema.safeParse({
      transport: { carType: 'none', carMilesPerWeek: 0, flightsShortPerYear: 0, flightsLongPerYear: 0, publicTransitDaysPerWeek: 0 },
      energy: { electricitySource: 'INVALID', heatingType: 'gas', homeSizeSqft: 1000, numPeople: 1 },
      diet: { dietType: 'omnivore', localFoodPercent: 10, foodWasteLevel: 'medium' },
      shopping: { newClothingItemsPerMonth: 0, electronicsPerYear: 0, onlineOrdersPerWeek: 0, buySecondhand: false },
    });
    expect(result.success).toBe(false);
  });
});

// ── ActivityLogInputSchema ──────────────────────────────────

describe('ActivityLogInputSchema', () => {
  const valid = {
    date: '2024-03-15',
    type: 'meal',
    label: 'Plant-based meal',
    co2Kg: -0.5,
  };

  it('accepts a valid activity log', () => {
    expect(ActivityLogInputSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional note', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, note: 'Great tofu curry' }).success).toBe(true);
  });

  it('rejects invalid date format', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, date: '15-03-2024' }).success).toBe(false);
  });

  it('rejects invalid activity type', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, type: 'sleep' }).success).toBe(false);
  });

  it('rejects empty label', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, label: '' }).success).toBe(false);
  });

  it('rejects note over 500 chars', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, note: 'x'.repeat(501) }).success).toBe(false);
  });
});

// ── LogActionSchema ─────────────────────────────────────────

describe('LogActionSchema', () => {
  it('accepts valid action log input', () => {
    expect(LogActionSchema.safeParse({ actionId: 'plant-meal-3x', co2SavedKg: 180 }).success).toBe(true);
  });

  it('rejects empty actionId', () => {
    expect(LogActionSchema.safeParse({ actionId: '', co2SavedKg: 180 }).success).toBe(false);
  });

  it('rejects negative co2SavedKg', () => {
    expect(LogActionSchema.safeParse({ actionId: 'plant-meal-3x', co2SavedKg: -1 }).success).toBe(false);
  });
});
