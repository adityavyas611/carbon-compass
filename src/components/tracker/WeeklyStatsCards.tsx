interface Props {
  weekSaved: number;
  weekEmitted: number;
  weekLogCount: number;
}

export default function WeeklyStatsCards({ weekSaved, weekEmitted, weekLogCount }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="card text-center">
        <div
          className="text-2xl font-bold text-forest-600 mb-0.5"
          aria-label={`${weekSaved.toFixed(1)} kilograms CO₂ saved this week`}
        >
          {weekSaved.toFixed(1)} kg
        </div>
        <p className="text-xs text-sage-500 dark:text-sage-400">CO₂ saved this week</p>
        <p className="text-xs text-forest-500 mt-1">≈ {Math.round(weekSaved / 0.21)} km not driven</p>
      </div>
      <div className="card text-center">
        <div
          className="text-2xl font-bold text-earth-600 mb-0.5"
          aria-label={`${weekEmitted.toFixed(1)} kilograms CO₂ emitted this week`}
        >
          {weekEmitted.toFixed(1)} kg
        </div>
        <p className="text-xs text-sage-500 dark:text-sage-400">CO₂ emitted this week</p>
        <p className="text-xs text-sage-400 dark:text-sage-500 mt-1">{weekLogCount} activities logged</p>
      </div>
    </div>
  );
}
