import type { ActivityType } from '@/types';

export const ACTIVITY_TYPES = ['meal', 'commute', 'purchase', 'energy'] as const satisfies readonly ActivityType[];

export const ACTIVITY_PRESETS: Record<ActivityType, { label: string; emoji: string; co2Kg: number }[]> = {
  meal: [
    { label: 'Plant-based meal', emoji: '🥗', co2Kg: -0.5 },
    { label: 'Chicken dish', emoji: '🍗', co2Kg: 1.1 },
    { label: 'Beef meal', emoji: '🥩', co2Kg: 3.6 },
    { label: 'Fish dish', emoji: '🐟', co2Kg: 0.9 },
    { label: 'Vegan meal', emoji: '🌱', co2Kg: 0.3 },
  ],
  commute: [
    { label: 'Drove alone (car)', emoji: '🚗', co2Kg: 4.2 },
    { label: 'Carpooled', emoji: '🚙', co2Kg: 2.1 },
    { label: 'Public transit', emoji: '🚌', co2Kg: 1.2 },
    { label: 'Biked / Walked', emoji: '🚲', co2Kg: 0 },
    { label: 'Worked from home', emoji: '🏠', co2Kg: 0 },
  ],
  purchase: [
    { label: 'New clothing item', emoji: '👕', co2Kg: 15 },
    { label: 'Secondhand item', emoji: '♻️', co2Kg: 4.5 },
    { label: 'Electronics', emoji: '💻', co2Kg: 300 },
    { label: 'Online delivery', emoji: '📦', co2Kg: 4.5 },
    { label: 'Farmers market', emoji: '🌾', co2Kg: -1 },
  ],
  energy: [
    { label: 'Thermostat -2°C', emoji: '🌡️', co2Kg: -0.8 },
    { label: 'Air dried laundry', emoji: '🧺', co2Kg: -0.5 },
    { label: 'Cold wash cycle', emoji: '❄️', co2Kg: -0.4 },
    { label: 'Extra heating used', emoji: '🔥', co2Kg: 2.5 },
    { label: 'Turned off standby', emoji: '💡', co2Kg: -0.1 },
  ],
};

export const TYPE_META: Record<
  ActivityType,
  { label: string; emoji: string; color: string }
> = {
  meal: { label: 'Meal', emoji: '🍽️', color: 'bg-green-100 text-green-700' },
  commute: { label: 'Commute', emoji: '🚌', color: 'bg-forest-100 text-forest-700' },
  purchase: { label: 'Purchase', emoji: '🛍️', color: 'bg-blue-100 text-blue-700' },
  energy: { label: 'Energy', emoji: '⚡', color: 'bg-earth-100 text-earth-700' },
};

export type ActivityPreset = (typeof ACTIVITY_PRESETS)[ActivityType][number];
