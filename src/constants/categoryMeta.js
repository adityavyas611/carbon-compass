export const FOOTPRINT_CATEGORY_KEYS = ['transport', 'energy', 'diet', 'shopping'];
export const CATEGORY_META = {
    transport: { label: 'Transport', emoji: '🚗', color: '#3a8c42', bg: 'bg-forest-100', text: 'text-forest-700' },
    energy: { label: 'Energy', emoji: '⚡', color: '#d9852a', bg: 'bg-earth-100', text: 'text-earth-700' },
    diet: { label: 'Diet', emoji: '🥗', color: '#5da863', bg: 'bg-green-100', text: 'text-green-700' },
    shopping: { label: 'Shopping', emoji: '🛍️', color: '#75a0c4', bg: 'bg-blue-100', text: 'text-blue-700' },
};
export const CHART_BAR_COLORS = {
    active: CATEGORY_META.transport.color,
    inactive: '#8ec692',
};
