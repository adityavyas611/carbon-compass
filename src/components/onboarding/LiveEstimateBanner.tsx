import { formatTonnes } from '@/utils/calculations';

interface LiveEstimateBannerProps {
  totalKg: number;
}

export default function LiveEstimateBanner({ totalKg }: LiveEstimateBannerProps) {
  return (
    <div className="bg-forest-600 text-white px-4 py-2.5 flex items-center justify-between" aria-live="polite" aria-atomic="true">
      <span className="text-sm font-medium text-white/95">Live estimate</span>
      <span className="text-base font-bold">{formatTonnes(totalKg)} CO₂e / year</span>
    </div>
  );
}
