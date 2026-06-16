import { z } from 'zod';

export const TransportSchema = z.object({
  carType: z.enum(['none', 'petrol', 'diesel', 'hybrid', 'electric']),
  carMilesPerWeek: z.number().min(0).max(1000),
  flightsShortPerYear: z.number().int().min(0).max(100),
  flightsLongPerYear: z.number().int().min(0).max(100),
  publicTransitDaysPerWeek: z.number().int().min(0).max(7),
});

export const EnergySchema = z.object({
  electricitySource: z.enum(['grid', 'renewable', 'solar', 'mixed']),
  heatingType: z.enum(['gas', 'oil', 'electric', 'heat-pump', 'none']),
  homeSizeSqft: z.number().min(100).max(20000),
  numPeople: z.number().int().min(1).max(20),
});

export const DietSchema = z.object({
  dietType: z.enum(['vegan', 'vegetarian', 'pescatarian', 'flexitarian', 'omnivore', 'heavy-meat']),
  localFoodPercent: z.number().min(0).max(100),
  foodWasteLevel: z.enum(['low', 'medium', 'high']),
});

export const ShoppingSchema = z.object({
  newClothingItemsPerMonth: z.number().int().min(0).max(100),
  electronicsPerYear: z.number().int().min(0).max(50),
  onlineOrdersPerWeek: z.number().min(0).max(100),
  buySecondhand: z.boolean(),
});

export const AssessmentSchema = z.object({
  transport: TransportSchema,
  energy: EnergySchema,
  diet: DietSchema,
  shopping: ShoppingSchema,
});

export const ActivityLogInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a YYYY-MM-DD date'),
  type: z.enum(['meal', 'commute', 'purchase', 'energy']),
  label: z.string().min(1).max(200).trim(),
  co2Kg: z.number().min(-1000).max(10000),
  note: z.string().max(500).trim().optional(),
});

export const LogActionSchema = z.object({
  actionId: z.string().min(1).max(100).trim(),
  co2SavedKg: z.number().min(0).max(100000),
});

export const FootprintBreakdownSchema = z.object({
  transport: z.number().min(0).max(1000000),
  energy: z.number().min(0).max(1000000),
  diet: z.number().min(0).max(1000000),
  shopping: z.number().min(0).max(1000000),
  total: z.number().min(0).max(1000000),
});

export type TransportInput = z.infer<typeof TransportSchema>;
export type EnergyInput = z.infer<typeof EnergySchema>;
export type DietInput = z.infer<typeof DietSchema>;
export type ShoppingInput = z.infer<typeof ShoppingSchema>;
export type AssessmentInput = z.infer<typeof AssessmentSchema>;
export type ActivityLogInput = z.infer<typeof ActivityLogInputSchema>;
export type LogActionInput = z.infer<typeof LogActionSchema>;
export type FootprintBreakdown = z.infer<typeof FootprintBreakdownSchema>;
