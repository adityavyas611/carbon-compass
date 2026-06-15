import type { TransportData } from '@/types';
import { Car, Plane, Train, ChevronRight } from 'lucide-react';

interface Props {
  data: TransportData;
  onChange: (d: TransportData) => void;
  onNext: () => void;
}

const CAR_TYPES = [
  { value: 'none', label: 'No car', emoji: '🚶' },
  { value: 'electric', label: 'Electric', emoji: '⚡' },
  { value: 'hybrid', label: 'Hybrid', emoji: '🔋' },
  { value: 'petrol', label: 'Petrol', emoji: '⛽' },
  { value: 'diesel', label: 'Diesel', emoji: '🛢️' },
] as const;

export default function TransportStep({ data, onChange, onNext }: Props) {
  const update = (patch: Partial<TransportData>) => onChange({ ...data, ...patch });

  return (
    <div className="px-4 py-5 max-w-lg mx-auto pb-24">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 bg-forest-100 dark:bg-forest-800 text-forest-700 dark:text-forest-200 rounded-full px-3 py-1 text-sm font-medium mb-3">
          <Car className="w-3.5 h-3.5" aria-hidden="true" /> Getting Around
        </div>
        <h1 className="text-2xl font-bold text-forest-900 dark:text-cream mb-1">How do you get around?</h1>
        <p className="text-sage-700 dark:text-sage-300 text-sm">Transport is often the biggest slice of your footprint. No judgment — we're just measuring.</p>
      </header>

      {/* Car type */}
      <fieldset className="mb-6">
        <legend className="block text-sm font-semibold text-forest-800 dark:text-cream mb-3">What kind of car do you drive?</legend>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {CAR_TYPES.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => update({ carType: ct.value })}
              aria-pressed={data.carType === ct.value}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                data.carType === ct.value
                  ? 'border-forest-500 bg-forest-50 text-forest-700 dark:bg-forest-800 dark:border-forest-500 dark:text-cream'
                  : 'border-sage-200 bg-white text-sage-700 hover:border-sage-300 dark:bg-forest-900 dark:border-forest-700 dark:text-sage-300 dark:hover:border-forest-600'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{ct.emoji}</span>
              <span className="text-xs font-medium">{ct.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Miles per week */}
      {data.carType !== 'none' && (
        <div className="mb-6">
          <label htmlFor="car-miles" className="block text-sm font-semibold text-forest-800 dark:text-cream mb-1">
            Miles driven per week
            <span className="ml-2 font-bold text-forest-600" aria-live="polite">{data.carMilesPerWeek} mi</span>
          </label>
          <p className="text-muted-sm mb-3" id="car-miles-hint">Average US commuter: ~100 miles/week</p>
          <input
            id="car-miles"
            type="range"
            min={0}
            max={500}
            step={5}
            value={data.carMilesPerWeek}
            onChange={(e) => update({ carMilesPerWeek: Number(e.target.value) })}
            aria-describedby="car-miles-hint"
            aria-valuetext={`${data.carMilesPerWeek} miles per week`}
            className="w-full accent-forest-600 h-2 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted mt-1" aria-hidden="true">
            <span>0</span><span>250</span><span>500</span>
          </div>
        </div>
      )}

      {/* Flights */}
      <fieldset className="mb-6">
        <legend className="block text-sm font-semibold text-forest-800 dark:text-cream mb-3 flex items-center gap-2">
          <Plane className="w-4 h-4" aria-hidden="true" /> Flights per year
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-sage-700 dark:text-sage-300 mb-2" id="short-flights-label">Short flights (&lt;3 hrs)</p>
            <div className="flex items-center gap-3" role="group" aria-labelledby="short-flights-label">
              <button
                type="button"
                onClick={() => update({ flightsShortPerYear: Math.max(0, data.flightsShortPerYear - 1) })}
                aria-label={`Decrease short flights, currently ${data.flightsShortPerYear}`}
                className="w-9 h-9 rounded-full bg-sage-100 hover:bg-sage-200 dark:bg-forest-800 dark:hover:bg-forest-700 font-bold text-forest-700 dark:text-cream transition-all flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-forest-900 dark:text-cream text-lg" aria-live="polite">{data.flightsShortPerYear}</span>
              <button
                type="button"
                onClick={() => update({ flightsShortPerYear: data.flightsShortPerYear + 1 })}
                aria-label={`Increase short flights, currently ${data.flightsShortPerYear}`}
                className="w-9 h-9 rounded-full bg-forest-100 hover:bg-forest-200 dark:bg-forest-800 dark:hover:bg-forest-700 font-bold text-forest-700 dark:text-cream transition-all flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-sage-700 dark:text-sage-300 mb-2" id="long-flights-label">Long flights (&gt;6 hrs)</p>
            <div className="flex items-center gap-3" role="group" aria-labelledby="long-flights-label">
              <button
                type="button"
                onClick={() => update({ flightsLongPerYear: Math.max(0, data.flightsLongPerYear - 1) })}
                aria-label={`Decrease long flights, currently ${data.flightsLongPerYear}`}
                className="w-9 h-9 rounded-full bg-sage-100 hover:bg-sage-200 dark:bg-forest-800 dark:hover:bg-forest-700 font-bold text-forest-700 dark:text-cream transition-all flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-forest-900 dark:text-cream text-lg" aria-live="polite">{data.flightsLongPerYear}</span>
              <button
                type="button"
                onClick={() => update({ flightsLongPerYear: data.flightsLongPerYear + 1 })}
                aria-label={`Increase long flights, currently ${data.flightsLongPerYear}`}
                className="w-9 h-9 rounded-full bg-forest-100 hover:bg-forest-200 dark:bg-forest-800 dark:hover:bg-forest-700 font-bold text-forest-700 dark:text-cream transition-all flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Public transit */}
      <div className="mb-8">
        <label htmlFor="transit-days" className="block text-sm font-semibold text-forest-800 dark:text-cream mb-1 flex items-center gap-2">
          <Train className="w-4 h-4" aria-hidden="true" /> Public transit days per week
          <span className="ml-auto font-bold text-forest-600" aria-live="polite">{data.publicTransitDaysPerWeek} days</span>
        </label>
        <input
          id="transit-days"
          type="range"
          min={0}
          max={7}
          step={1}
          value={data.publicTransitDaysPerWeek}
          onChange={(e) => update({ publicTransitDaysPerWeek: Number(e.target.value) })}
          aria-valuetext={`${data.publicTransitDaysPerWeek} days per week`}
          className="w-full accent-forest-600 h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted mt-1" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => <span key={n}>{n}</span>)}
        </div>
      </div>

      <button type="button" onClick={onNext} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
        Next: Home Energy <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
