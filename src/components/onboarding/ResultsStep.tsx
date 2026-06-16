import { ArrowRight, ChevronLeft } from 'lucide-react';
import ResultsScoreHeader, { ResultsComparisonCard } from '@/components/onboarding/ResultsScoreHeader';
import ResultsBreakdownChart from '@/components/onboarding/ResultsBreakdownChart';

interface Props {
  transport: number;
  energy: number;
  diet: number;
  shopping: number;
  total: number;
  onFinish: () => void;
  onBack: () => void;
}

export default function ResultsStep({ transport, energy, diet, shopping, total, onFinish, onBack }: Props) {
  return (
    <div className="px-4 py-5 max-w-lg mx-auto pb-24">
      <h1 className="sr-only">Your Carbon Footprint Results</h1>

      <ResultsScoreHeader total={total} />
      <ResultsBreakdownChart transport={transport} energy={energy} diet={diet} shopping={shopping} total={total} />
      <ResultsComparisonCard total={total} />

      <div className="flex gap-3">
        <button onClick={onBack} aria-label="Go back to shopping" className="btn-outline flex items-center gap-2 py-3.5 px-4">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <button onClick={onFinish} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
          See My Action Plan <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
