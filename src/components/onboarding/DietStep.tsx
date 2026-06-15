import type { DietData } from '@/types';
import { Utensils, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  data: DietData;
  onChange: (d: DietData) => void;
  onNext: () => void;
  onBack: () => void;
}

const DIET_TYPES = [
  { value: 'vegan', label: 'Vegan', emoji: '🌱', desc: 'No animal products' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦', desc: 'No meat or fish' },
  { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟', desc: 'Fish but no meat' },
  { value: 'flexitarian', label: 'Flexitarian', emoji: '🥗', desc: 'Mostly plant-based' },
  { value: 'omnivore', label: 'Omnivore', emoji: '🍽️', desc: 'Balanced meat & veg' },
  { value: 'heavy-meat', label: 'Meat-heavy', emoji: '🥩', desc: 'Meat most meals' },
] as const;

const WASTE_LEVELS = [
  { value: 'low', label: 'Very little', emoji: '✅', desc: 'Rarely throw food away' },
  { value: 'medium', label: 'Some', emoji: '⚖️', desc: 'Average household waste' },
  { value: 'high', label: 'Quite a bit', emoji: '🗑️', desc: 'Often discard leftovers' },
] as const;

export default function DietStep({ data, onChange, onNext, onBack }: Props) {
  const update = (patch: Partial<DietData>) => onChange({ ...data, ...patch });

  return (
    <div className="px-4 py-5 max-w-lg mx-auto pb-24">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 bg-earth-100 dark:bg-earth-900/40 text-earth-700 dark:text-earth-300 rounded-full px-3 py-1 text-sm font-medium mb-3">
          <Utensils className="w-3.5 h-3.5" aria-hidden="true" /> Food &amp; Diet
        </div>
        <h1 className="text-2xl font-bold text-forest-900 dark:text-cream mb-1">How do you eat?</h1>
        <p className="text-sage-700 dark:text-sage-300 text-sm">Food systems produce about a third of global emissions. Your choices matter.</p>
      </header>

      {/* Diet type */}
      <fieldset className="mb-6">
        <legend className="block text-sm font-semibold text-forest-800 dark:text-cream mb-3">Best describes your diet</legend>
        <div className="grid grid-cols-2 gap-2">
          {DIET_TYPES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => update({ dietType: d.value })}
              aria-pressed={data.dietType === d.value}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                data.dietType === d.value
                  ? 'border-forest-500 bg-forest-50 dark:bg-forest-800 dark:border-forest-500'
                  : 'border-sage-200 bg-white hover:border-sage-300 dark:bg-forest-900 dark:border-forest-700 dark:hover:border-forest-600'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{d.emoji}</span>
              <div>
                <div className={`text-sm font-semibold ${data.dietType === d.value ? 'text-forest-700 dark:text-cream' : 'text-forest-900 dark:text-cream'}`}>{d.label}</div>
                <div className="text-xs text-muted">{d.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Local food */}
      <div className="mb-6">
        <label htmlFor="local-food" className="block text-sm font-semibold text-forest-800 dark:text-cream mb-1">
          How much of your food is locally grown?
          <span className="ml-2 font-bold text-forest-600" aria-live="polite">{data.localFoodPercent}%</span>
        </label>
        <p className="text-muted-sm mb-3" id="local-food-hint">Local food typically has lower transport emissions</p>
        <input
          id="local-food"
          type="range"
          min={0}
          max={100}
          step={10}
          value={data.localFoodPercent}
          onChange={(e) => update({ localFoodPercent: Number(e.target.value) })}
          aria-describedby="local-food-hint"
          aria-valuetext={`${data.localFoodPercent}% local food`}
          className="w-full accent-forest-600 h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted mt-1" aria-hidden="true">
          <span>Almost none</span><span>Half</span><span>Mostly local</span>
        </div>
      </div>

      {/* Food waste */}
      <fieldset className="mb-8">
        <legend className="block text-sm font-semibold text-forest-800 dark:text-cream mb-3">How much food do you waste?</legend>
        <div className="flex gap-3">
          {WASTE_LEVELS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => update({ foodWasteLevel: w.value })}
              aria-pressed={data.foodWasteLevel === w.value}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                data.foodWasteLevel === w.value
                  ? 'border-forest-500 bg-forest-50 dark:bg-forest-800 dark:border-forest-500'
                  : 'border-sage-200 bg-white hover:border-sage-300 dark:bg-forest-900 dark:border-forest-700 dark:hover:border-forest-600'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{w.emoji}</span>
              <div className="text-center">
                <div className={`text-xs font-semibold ${data.foodWasteLevel === w.value ? 'text-forest-700 dark:text-cream' : 'text-forest-900 dark:text-cream'}`}>{w.label}</div>
                <div className="text-xs text-muted mt-0.5">{w.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} aria-label="Go back to home energy" className="btn-outline flex items-center gap-2 py-3.5 px-4">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
          Next: Shopping <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
