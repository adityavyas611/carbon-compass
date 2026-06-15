import type { ShoppingData } from '@/types';
import { ShoppingBag, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface Props {
  data: ShoppingData;
  onChange: (d: ShoppingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ShoppingStep({ data, onChange, onNext, onBack }: Props) {
  const update = (patch: Partial<ShoppingData>) => onChange({ ...data, ...patch });

  return (
    <div className="px-4 py-5 max-w-lg mx-auto pb-24">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium mb-3">
          <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Shopping
        </div>
        <h1 className="text-2xl font-bold text-forest-900 mb-1">What do you buy?</h1>
        <p className="text-sage-600 text-sm">Consumer goods account for around 10–15% of most people's footprints.</p>
      </header>

      {/* Clothing */}
      <div className="mb-6 card">
        <label htmlFor="clothing-items" className="flex items-center gap-2 mb-1 cursor-pointer">
          <span className="text-lg" aria-hidden="true">👕</span>
          <span className="text-sm font-semibold text-forest-800">New clothing items per month</span>
        </label>
        <p className="text-xs text-sage-500 mb-4" id="clothing-hint">Include shoes, accessories, sportswear</p>
        <input
          id="clothing-items"
          type="range"
          min={0}
          max={20}
          step={1}
          value={data.newClothingItemsPerMonth}
          onChange={(e) => update({ newClothingItemsPerMonth: Number(e.target.value) })}
          aria-describedby="clothing-hint"
          aria-valuetext={`${data.newClothingItemsPerMonth} items per month`}
          className="w-full accent-forest-600 h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs mt-2" aria-hidden="true">
          <span className="text-sage-400">0</span>
          <span className="font-bold text-forest-600 text-base" aria-live="polite">{data.newClothingItemsPerMonth} items/month</span>
          <span className="text-sage-400">20</span>
        </div>
      </div>

      {/* Electronics */}
      <div className="mb-6 card">
        <p className="text-sm font-semibold text-forest-800 mb-1 flex items-center gap-2" id="electronics-label">
          <span className="text-lg" aria-hidden="true">💻</span>
          New electronics per year
        </p>
        <p className="text-xs text-sage-500 mb-4">Phones, laptops, tablets, TVs, etc.</p>
        <div className="flex items-center gap-4" role="group" aria-labelledby="electronics-label">
          <button
            type="button"
            onClick={() => update({ electronicsPerYear: Math.max(0, data.electronicsPerYear - 1) })}
            aria-label={`Decrease electronics per year, currently ${data.electronicsPerYear}`}
            className="w-10 h-10 rounded-full bg-sage-100 hover:bg-sage-200 font-bold text-forest-700 transition-all flex items-center justify-center text-lg"
          >
            −
          </button>
          <span className="text-3xl font-bold text-forest-900 w-16 text-center" aria-live="polite">{data.electronicsPerYear}</span>
          <button
            type="button"
            onClick={() => update({ electronicsPerYear: data.electronicsPerYear + 1 })}
            aria-label={`Increase electronics per year, currently ${data.electronicsPerYear}`}
            className="w-10 h-10 rounded-full bg-forest-100 hover:bg-forest-200 font-bold text-forest-700 transition-all flex items-center justify-center text-lg"
          >
            +
          </button>
          <span className="text-sm text-sage-500">{data.electronicsPerYear === 1 ? 'device' : 'devices'}</span>
        </div>
      </div>

      {/* Online orders */}
      <div className="mb-6 card">
        <label htmlFor="online-orders" className="flex items-center gap-2 mb-1 cursor-pointer">
          <span className="text-lg" aria-hidden="true">📦</span>
          <span className="text-sm font-semibold text-forest-800">Online orders per week</span>
        </label>
        <p className="text-xs text-sage-500 mb-4" id="online-orders-hint">Include groceries, Amazon, clothing sites, etc.</p>
        <input
          id="online-orders"
          type="range"
          min={0}
          max={20}
          step={1}
          value={data.onlineOrdersPerWeek}
          onChange={(e) => update({ onlineOrdersPerWeek: Number(e.target.value) })}
          aria-describedby="online-orders-hint"
          aria-valuetext={`${data.onlineOrdersPerWeek} orders per week`}
          className="w-full accent-forest-600 h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs mt-2" aria-hidden="true">
          <span className="text-sage-400">0</span>
          <span className="font-bold text-forest-600 text-base" aria-live="polite">{data.onlineOrdersPerWeek} orders/week</span>
          <span className="text-sage-400">20</span>
        </div>
      </div>

      {/* Secondhand toggle */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => update({ buySecondhand: !data.buySecondhand })}
          aria-pressed={data.buySecondhand}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
            data.buySecondhand
              ? 'border-forest-500 bg-forest-50'
              : 'border-sage-200 bg-white hover:border-sage-300'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              data.buySecondhand ? 'bg-forest-600 border-forest-600' : 'border-sage-300'
            }`}
            aria-hidden="true"
          >
            {data.buySecondhand && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-forest-900">I regularly buy secondhand</div>
            <div className="text-xs text-sage-500">Thrift stores, resale apps, hand-me-downs</div>
          </div>
          <span className="ml-auto text-xl" aria-hidden="true">♻️</span>
        </button>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} aria-label="Go back to diet" className="btn-outline flex items-center gap-2 py-3.5 px-4">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
          See My Results <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
