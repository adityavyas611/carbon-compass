import { describe, it, expect } from 'vitest';
import { AssessmentSchema, FootprintBreakdownSchema } from '@/lib/schemas';

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

describe('FootprintBreakdownSchema', () => {
  const valid = { transport: 1000, energy: 500, diet: 800, shopping: 300, total: 2600 };

  it('accepts a valid footprint breakdown', () => {
    expect(FootprintBreakdownSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects negative category values', () => {
    expect(FootprintBreakdownSchema.safeParse({ ...valid, transport: -1 }).success).toBe(false);
  });
});
