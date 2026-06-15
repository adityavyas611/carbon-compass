import type { Action, FootprintBreakdown } from '@/types';

export const ALL_ACTIONS: Action[] = [
  // ── Diet ──────────────────────────────────────
  {
    id: 'plant-meal-3x',
    title: 'Plant-based meals 3× per week',
    description: 'Swap meat for beans, lentils, or tofu three times weekly. Biggest single diet win.',
    category: 'diet',
    difficulty: 'Easy',
    co2SavedKg: 180,
    icon: '🥗',
    tips: ['Try "Meatless Monday + 2 more days"', 'Lentil soup and veggie stir-fry are fast options'],
  },
  {
    id: 'cut-beef',
    title: 'Cut beef consumption by half',
    description: 'Beef has 20× the footprint of chicken. Halving it saves significantly.',
    category: 'diet',
    difficulty: 'Medium',
    co2SavedKg: 320,
    icon: '🌱',
    tips: ['Swap beef mince for turkey or lentils in bolognese', 'Try a bean burger instead of beef'],
  },
  {
    id: 'reduce-food-waste',
    title: 'Cut food waste in half',
    description: 'Plan meals, use leftovers, and compost scraps to reduce waste emissions.',
    category: 'diet',
    difficulty: 'Easy',
    co2SavedKg: 110,
    icon: '♻️',
    tips: ["Plan your week's meals on Sunday", 'Store produce properly to extend life'],
  },
  {
    id: 'local-seasonal',
    title: 'Eat local and seasonal produce',
    description: 'Seasonal, locally-grown food has a fraction of the transport emissions.',
    category: 'diet',
    difficulty: 'Easy',
    co2SavedKg: 65,
    icon: '🌾',
    tips: ['Visit a farmers market this weekend', 'Use a seasonal produce guide for your region'],
  },

  // ── Transport ─────────────────────────────────
  {
    id: 'wfh-2days',
    title: 'Work from home 2 days/week',
    description: 'Eliminating commute twice weekly significantly reduces your transport footprint.',
    category: 'transport',
    difficulty: 'Medium',
    co2SavedKg: 420,
    icon: '🏠',
    tips: ['Talk to your manager about a hybrid schedule', 'Track the savings to stay motivated'],
  },
  {
    id: 'ev-switch',
    title: 'Switch to an electric vehicle',
    description: 'EVs produce 70–90% less CO₂ than petrol cars on a lifecycle basis.',
    category: 'transport',
    difficulty: 'Habit Change',
    co2SavedKg: 1200,
    icon: '⚡',
    tips: ['Check government EV incentives in your area', 'Consider a hybrid as a stepping stone'],
  },
  {
    id: 'one-less-flight',
    title: 'Replace one flight with train/video',
    description: 'A single avoided long-haul flight can save over a tonne of CO₂.',
    category: 'transport',
    difficulty: 'Medium',
    co2SavedKg: 1620,
    icon: '🚂',
    tips: ['Eurostar vs flying saves ~90% CO₂', 'Use video calls for business meetings'],
  },
  {
    id: 'bike-commute',
    title: 'Bike or walk for short trips',
    description: 'Trips under 3 miles by bike instead of car save fuel and carbon.',
    category: 'transport',
    difficulty: 'Easy',
    co2SavedKg: 150,
    icon: '🚲',
    tips: ['Try biking one day a week first', 'Get a bike repair kit for confidence'],
  },
  {
    id: 'carpool',
    title: 'Carpool with a colleague',
    description: 'Sharing a commute halves the per-person emissions of driving.',
    category: 'transport',
    difficulty: 'Easy',
    co2SavedKg: 280,
    icon: '🚗',
    tips: ['Use apps like Waze Carpool or a company rideshare board'],
  },

  // ── Energy ────────────────────────────────────
  {
    id: 'green-energy',
    title: 'Switch to a green energy tariff',
    description: 'Renewable electricity can cut your home energy footprint by over 80%.',
    category: 'energy',
    difficulty: 'Easy',
    co2SavedKg: 860,
    icon: '☀️',
    tips: ['Takes 10 minutes to switch providers online', 'Look for 100% renewable certified plans'],
  },
  {
    id: 'lower-thermostat',
    title: 'Lower thermostat by 2°C in winter',
    description: 'Each degree lower saves roughly 8–10% on heating energy costs.',
    category: 'energy',
    difficulty: 'Easy',
    co2SavedKg: 190,
    icon: '🌡️',
    tips: ['Use a programmable thermostat', 'Wear a warm layer instead of cranking the heat'],
  },
  {
    id: 'led-bulbs',
    title: 'Replace all bulbs with LEDs',
    description: 'LEDs use 75% less energy than incandescent bulbs and last 25× longer.',
    category: 'energy',
    difficulty: 'Easy',
    co2SavedKg: 60,
    icon: '💡',
    tips: ['Start with the most-used rooms', 'LED bulbs pay back their cost in under a year'],
  },
  {
    id: 'insulate-home',
    title: 'Improve home insulation',
    description: 'Proper insulation can reduce heating/cooling energy by 25–40%.',
    category: 'energy',
    difficulty: 'Habit Change',
    co2SavedKg: 520,
    icon: '🏡',
    tips: ['Start with draught-proofing doors and windows', 'Check for home energy grants in your area'],
  },

  // ── Shopping ──────────────────────────────────
  {
    id: 'buy-secondhand',
    title: 'Buy secondhand clothing',
    description: 'Secondhand fashion reduces a garment\'s carbon cost by up to 70%.',
    category: 'shopping',
    difficulty: 'Easy',
    co2SavedKg: 90,
    icon: '👕',
    tips: ['Try Depop, ThredUp, or local charity shops', 'Start with basics: jeans, jackets'],
  },
  {
    id: 'clothing-cull',
    title: 'Halve new clothing purchases',
    description: 'The fashion industry accounts for 10% of global emissions. Buy less, buy better.',
    category: 'shopping',
    difficulty: 'Medium',
    co2SavedKg: 120,
    icon: '🛍️',
    tips: ['Apply a 30-day waiting rule before buying', 'Mend and repair before replacing'],
  },
  {
    id: 'reduce-online-orders',
    title: 'Batch online orders',
    description: 'Fewer, larger orders mean less last-mile delivery and less packaging waste.',
    category: 'shopping',
    difficulty: 'Easy',
    co2SavedKg: 55,
    icon: '📦',
    tips: ['Wait to bundle multiple items in one order', 'Choose slower delivery—it\'s usually greener'],
  },
];

export function getTopActions(
  footprint: FootprintBreakdown,
  count = 3,
  actionPool: Action[] = ALL_ACTIONS,
): Action[] {
  const categories = [
    { key: 'transport' as const, val: footprint.transport },
    { key: 'energy' as const, val: footprint.energy },
    { key: 'diet' as const, val: footprint.diet },
    { key: 'shopping' as const, val: footprint.shopping },
  ].sort((a, b) => b.val - a.val);

  const result: Action[] = [];
  for (const cat of categories) {
    if (result.length >= count) break;
    const candidates = actionPool
      .filter((a) => a.category === cat.key)
      .sort((a, b) => b.co2SavedKg - a.co2SavedKg);
    if (candidates[0]) result.push(candidates[0]);
  }

  // Fill remaining slots from highest savings
  if (result.length < count) {
    const remaining = actionPool
      .filter((a) => !result.find((r) => r.id === a.id))
      .sort((a, b) => b.co2SavedKg - a.co2SavedKg);
    result.push(...remaining.slice(0, count - result.length));
  }

  return result.slice(0, count);
}
