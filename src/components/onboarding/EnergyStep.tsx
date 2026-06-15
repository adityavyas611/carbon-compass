import type { EnergyData } from '@/types';
import { Zap, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  data: EnergyData;
  onChange: (d: EnergyData) => void;
  onNext: () => void;
  onBack: () => void;
}

const ELECTRICITY_SOURCES = [
  { value: 'grid', label: 'Standard grid', emoji: '🏭', desc: 'Mix of coal, gas & renewables' },
  { value: 'mixed', label: 'Part renewable', emoji: '🌤️', desc: 'Some green energy mixed in' },
  { value: 'renewable', label: 'Green tariff', emoji: '🌿', desc: 'Certified renewable plan' },
  { value: 'solar', label: 'Solar panels', emoji: '☀️', desc: 'Self-generated solar power' },
] as const;

const HEATING_TYPES = [
  { value: 'gas', label: 'Natural gas', emoji: '🔥' },
  { value: 'oil', label: 'Heating oil', emoji: '🛢️' },
  { value: 'electric', label: 'Electric', emoji: '⚡' },
  { value: 'heat-pump', label: 'Heat pump', emoji: '🌡️' },
  { value: 'none', label: 'No heating', emoji: '❄️' },
] as const;

export default function EnergyStep({ data, onChange, onNext, onBack }: Props) {
  const update = (patch: Partial<EnergyData>) => onChange({ ...data, ...patch });

  return (
    <div className="px-4 py-5 max-w-lg mx-auto pb-24">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 bg-earth-100 dark:bg-earth-900/40 text-earth-700 dark:text-earth-300 rounded-full px-3 py-1 text-sm font-medium mb-3">
          <Zap className="w-3.5 h-3.5" aria-hidden="true" /> Home Energy
        </div>
        <h1 className="text-2xl font-bold text-forest-900 dark:text-cream mb-1">What powers your home?</h1>
        <p className="text-sage-700 dark:text-sage-300 text-sm">Heating and electricity can make up 20–30% of your footprint.</p>
      </header>

      {/* Electricity source */}
      <fieldset className="mb-6">
        <legend className="block text-sm font-semibold text-forest-800 dark:text-cream mb-3">Electricity source</legend>
        <div className="grid grid-cols-2 gap-2">
          {ELECTRICITY_SOURCES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => update({ electricitySource: s.value })}
              aria-pressed={data.electricitySource === s.value}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                data.electricitySource === s.value
                  ? 'border-forest-500 bg-forest-50 dark:bg-forest-800 dark:border-forest-500'
                  : 'border-sage-200 bg-white hover:border-sage-300 dark:bg-forest-900 dark:border-forest-700 dark:hover:border-forest-600'
              }`}
            >
              <span className="text-xl mt-0.5" aria-hidden="true">{s.emoji}</span>
              <div>
                <div className={`text-sm font-semibold ${data.electricitySource === s.value ? 'text-forest-700 dark:text-cream' : 'text-forest-900 dark:text-cream'}`}>{s.label}</div>
                <div className="text-xs text-muted">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Heating type */}
      <fieldset className="mb-6">
        <legend className="block text-sm font-semibold text-forest-800 dark:text-cream mb-3">Primary heating</legend>
        <div className="flex flex-wrap gap-2">
          {HEATING_TYPES.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => update({ heatingType: h.value })}
              aria-pressed={data.heatingType === h.value}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                data.heatingType === h.value
                  ? 'border-forest-500 bg-forest-50 text-forest-700 dark:bg-forest-800 dark:border-forest-500 dark:text-cream'
                  : 'border-sage-200 bg-white text-sage-700 hover:border-sage-300 dark:bg-forest-900 dark:border-forest-700 dark:text-sage-300 dark:hover:border-forest-600'
              }`}
            >
              <span aria-hidden="true">{h.emoji}</span> {h.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Home size */}
      <div className="mb-6">
        <label htmlFor="home-size" className="block text-sm font-semibold text-forest-800 dark:text-cream mb-1">
          Home size
          <span className="ml-2 font-bold text-forest-600" aria-live="polite">{data.homeSizeSqft.toLocaleString()} sq ft</span>
        </label>
        <p className="text-muted-sm mb-3" id="home-size-hint">US average: ~2,000 sq ft</p>
        <input
          id="home-size"
          type="range"
          min={300}
          max={5000}
          step={50}
          value={data.homeSizeSqft}
          onChange={(e) => update({ homeSizeSqft: Number(e.target.value) })}
          aria-describedby="home-size-hint"
          aria-valuetext={`${data.homeSizeSqft.toLocaleString()} square feet`}
          className="w-full accent-forest-600 h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted mt-1" aria-hidden="true">
          <span>Small</span><span>Average</span><span>Large</span>
        </div>
      </div>

      {/* Number of people */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-forest-800 dark:text-cream mb-3" id="num-people-label">People in your home</p>
        <div className="flex items-center gap-4" role="group" aria-labelledby="num-people-label">
          <button
            type="button"
            onClick={() => update({ numPeople: Math.max(1, data.numPeople - 1) })}
            aria-label={`Decrease number of people, currently ${data.numPeople}`}
            className="w-10 h-10 rounded-full bg-sage-100 hover:bg-sage-200 dark:bg-forest-800 dark:hover:bg-forest-700 font-bold text-forest-700 dark:text-cream transition-all flex items-center justify-center text-lg"
          >
            −
          </button>
          <span className="text-3xl font-bold text-forest-900 dark:text-cream w-12 text-center" aria-live="polite">{data.numPeople}</span>
          <button
            type="button"
            onClick={() => update({ numPeople: data.numPeople + 1 })}
            aria-label={`Increase number of people, currently ${data.numPeople}`}
            className="w-10 h-10 rounded-full bg-forest-100 hover:bg-forest-200 dark:bg-forest-800 dark:hover:bg-forest-700 font-bold text-forest-700 dark:text-cream transition-all flex items-center justify-center text-lg"
          >
            +
          </button>
          <span className="text-sm text-muted">
            {data.numPeople === 1 ? 'person' : 'people'}
          </span>
        </div>
        <p className="text-muted-sm mt-2">We split home emissions equally among residents</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} aria-label="Go back to transport" className="btn-outline flex items-center gap-2 py-3.5 px-4">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
          Next: Food &amp; Diet <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
