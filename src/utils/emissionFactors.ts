/**
 * Emission factors based on UK DEFRA 2023 / IPCC AR6 standards
 * All values in kg CO₂e per unit
 */

// ──────────────────────────────────────────────
// Transport
// ──────────────────────────────────────────────
export const TRANSPORT_FACTORS = {
  // kg CO₂e per mile driven
  car: {
    petrol: 0.356,
    diesel: 0.374,
    hybrid: 0.192,
    electric: 0.053,
    none: 0,
  },
  // kg CO₂e per flight (average round trip)
  flight: {
    short: 255,   // <3 hours, e.g. domestic
    long: 1620,   // >6 hours, e.g. transatlantic
  },
  // kg CO₂e per mile
  publicTransit: 0.089,
  publicTransitMilesPerDay: 12,
};

// ──────────────────────────────────────────────
// Home Energy
// ──────────────────────────────────────────────
export const ENERGY_FACTORS = {
  // Annual kg CO₂e per sqft per person (base)
  electricity: {
    grid: 0.233,
    mixed: 0.140,
    renewable: 0.021,
    solar: 0.012,
  },
  heating: {
    gas: 2.04,         // kg CO₂e per m³ gas (annual per 1000 sqft)
    oil: 2.54,
    electric: 0.233,
    'heat-pump': 0.089,
    none: 0,
  },
  // Baseline annual energy kg CO₂e per 1000 sqft per person
  baselineElectricity: 1800,
  baselineHeating: 2200,
};

// ──────────────────────────────────────────────
// Diet
// ──────────────────────────────────────────────
export const DIET_FACTORS = {
  // Annual kg CO₂e per diet type
  annual: {
    vegan: 1500,
    vegetarian: 1700,
    pescatarian: 1900,
    flexitarian: 2200,
    omnivore: 2800,
    'heavy-meat': 3600,
  },
  // Local food discount factor
  localDiscount: 0.15,   // 15% reduction for 100% local
  // Waste multiplier
  waste: {
    low: 0.95,
    medium: 1.0,
    high: 1.12,
  },
};

// ──────────────────────────────────────────────
// Shopping
// ──────────────────────────────────────────────
export const SHOPPING_FACTORS = {
  // kg CO₂e per item
  clothing: 15,          // avg per garment
  electronics: 300,      // avg per device
  onlineOrder: 4.5,      // per parcel
  secondhandDiscount: 0.7, // 70% reduction vs new
};

// ──────────────────────────────────────────────
// Averages for comparison
// ──────────────────────────────────────────────
export const AVERAGES = {
  // Annual tonnes CO₂e
  global: 4.8,
  usa: 14.5,
  uk: 5.5,
  eu: 7.2,
  india: 1.9,
  // Paris Agreement target by 2030
  parisTarget: 2.0,
};
