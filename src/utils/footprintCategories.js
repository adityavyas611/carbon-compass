import { CATEGORY_META, FOOTPRINT_CATEGORY_KEYS } from '@/constants/categoryMeta';
export function sortFootprintCategories(footprint) {
    return FOOTPRINT_CATEGORY_KEYS.map((key) => ({ key, value: footprint[key] })).sort((a, b) => b.value - a.value);
}
export function getBiggestCategoryKey(footprint) {
    return sortFootprintCategories(footprint)[0]?.key ?? 'transport';
}
export function footprintToChartData(footprint) {
    return FOOTPRINT_CATEGORY_KEYS.map((key) => ({
        name: CATEGORY_META[key].label,
        value: Math.round(footprint[key]),
        fill: CATEGORY_META[key].color,
    })).filter((d) => d.value > 0);
}
export function footprintToCategoryRows(footprint) {
    return FOOTPRINT_CATEGORY_KEYS.map((key) => ({
        key,
        label: CATEGORY_META[key].label,
        value: footprint[key],
        color: CATEGORY_META[key].color,
        emoji: CATEGORY_META[key].emoji,
    })).sort((a, b) => b.value - a.value);
}
