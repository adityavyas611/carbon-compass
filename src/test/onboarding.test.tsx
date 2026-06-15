import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { TransportData, EnergyData, DietData, ShoppingData } from '@/types';
import TransportStep from '@/components/onboarding/TransportStep';
import EnergyStep from '@/components/onboarding/EnergyStep';
import DietStep from '@/components/onboarding/DietStep';
import ShoppingStep from '@/components/onboarding/ShoppingStep';
import ResultsStep from '@/components/onboarding/ResultsStep';
import AssessmentFlow from '@/components/onboarding/AssessmentFlow';
import { renderWithTheme } from '@/test/test-utils';

import React from 'react';

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial','animate','exit','transition','variants','custom','layout','layoutId','whileHover','whileTap','whileFocus','whileInView']);
  const motionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, variants, custom, ...p }, ref) => {
      if (variants && typeof variants === 'object') {
        const v = variants as { enter?: (d: number) => unknown; exit?: (d: number) => unknown };
        const dir = typeof custom === 'number' ? custom : 1;
        if (typeof v.enter === 'function') v.enter(dir);
        if (typeof v.exit === 'function') v.exit(dir);
      }
      return React.createElement(
        tag,
        { ...Object.fromEntries(Object.entries(p).filter(([k]) => !MOTION_PROPS.has(k))), ref },
        children,
      );
    });
  const cache = new Map<string, unknown>();
  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_, tag: string) => {
      if (!cache.has(tag)) cache.set(tag, motionComponent(tag));
      return cache.get(tag);
    },
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
  };
});

// Recharts ResponsiveContainer requires real dimensions — mock to a simple wrapper
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => null,
  Tooltip: ({ content, formatter }: { content?: React.ReactElement; formatter?: (v: unknown) => [string, string] }) => {
    if (formatter) {
      // Exercises ResultsStep's inline formatter (line 98): (v) => [`${Math.round(Number(v))} kg`, '']
      const [label] = formatter(1500);
      return <div>{label}</div>;
    }
    if (!content) return null;
    const C = content.type as React.ComponentType<{ active?: boolean; payload?: { name: string; value: number }[] }>;
    return (
      <>
        <C active payload={[{ name: 'Transport', value: 2000 }]} />
        <C active={false} payload={[]} />
      </>
    );
  },
}));

const mockCompleteAssessment = vi.fn();
vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => ({
    completeAssessment: mockCompleteAssessment,
  })),
}));

// ── TransportStep ───────────────────────────────────────────

const DEFAULT_TRANSPORT: TransportData = {
  carType: 'petrol',
  carMilesPerWeek: 100,
  flightsShortPerYear: 2,
  flightsLongPerYear: 1,
  publicTransitDaysPerWeek: 3,
};

describe('TransportStep', () => {
  const onNext = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_TRANSPORT) =>
    render(<TransportStep data={data} onChange={onChange} onNext={onNext} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('renders all car type options', () => {
    render_();
    expect(screen.getByRole('button', { name: /no car/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /electric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /petrol/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /diesel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hybrid/i })).toBeInTheDocument();
  });

  it('shows car miles slider when carType is not none', () => {
    render_();
    expect(screen.getByLabelText(/miles driven per week/i)).toBeInTheDocument();
  });

  it('hides car miles slider when carType is none', () => {
    render_({ ...DEFAULT_TRANSPORT, carType: 'none' });
    expect(screen.queryByLabelText(/miles driven per week/i)).not.toBeInTheDocument();
  });

  it('calls onChange when a car type is selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /electric/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, carType: 'electric' });
  });

  it('calls onChange when car miles slider changes', () => {
    render_();
    const slider = screen.getByLabelText(/miles driven per week/i);
    fireEvent.change(slider, { target: { value: '200' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, carMilesPerWeek: 200 });
  });

  it('calls onChange when short flight − button clicked', () => {
    render_();
    const decBtn = screen.getAllByLabelText(/decrease short flights/i)[0];
    fireEvent.click(decBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 1 });
  });

  it('calls onChange when short flight + button clicked', () => {
    render_();
    const incBtn = screen.getAllByLabelText(/increase short flights/i)[0];
    fireEvent.click(incBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 3 });
  });

  it('short flights do not go below 0', () => {
    render_({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 0 });
    const decBtn = screen.getAllByLabelText(/decrease short flights/i)[0];
    fireEvent.click(decBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 0 });
  });

  it('calls onChange when long flight − button clicked', () => {
    render_();
    const decBtn = screen.getAllByLabelText(/decrease long flights/i)[0];
    fireEvent.click(decBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsLongPerYear: 0 });
  });

  it('calls onChange when long flight + button clicked', () => {
    render_();
    const incBtn = screen.getAllByLabelText(/increase long flights/i)[0];
    fireEvent.click(incBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsLongPerYear: 2 });
  });

  it('calls onChange when transit slider changes', () => {
    render_();
    const slider = screen.getByLabelText(/public transit days per week/i);
    fireEvent.change(slider, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, publicTransitDaysPerWeek: 5 });
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('selected car type button has aria-pressed=true', () => {
    render_();
    const petrolBtn = screen.getByRole('button', { name: /petrol/i });
    expect(petrolBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('unselected car type button has aria-pressed=false', () => {
    render_();
    const electricBtn = screen.getByRole('button', { name: /electric/i });
    expect(electricBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

// ── EnergyStep ──────────────────────────────────────────────

const DEFAULT_ENERGY: EnergyData = {
  electricitySource: 'grid',
  heatingType: 'gas',
  homeSizeSqft: 1200,
  numPeople: 2,
};

describe('EnergyStep', () => {
  const onNext = vi.fn();
  const onBack = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_ENERGY) =>
    render(<EnergyStep data={data} onChange={onChange} onNext={onNext} onBack={onBack} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /what powers your home/i })).toBeInTheDocument();
  });

  it('renders all electricity sources', () => {
    render_();
    expect(screen.getByRole('button', { name: /standard grid/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /part renewable/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /green tariff/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solar panels/i })).toBeInTheDocument();
  });

  it('renders all heating types', () => {
    render_();
    expect(screen.getByRole('button', { name: /natural gas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heating oil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heat pump/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no heating/i })).toBeInTheDocument();
  });

  it('calls onChange when electricity source selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /solar panels/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, electricitySource: 'solar' });
  });

  it('calls onChange when heating type selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /heat pump/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, heatingType: 'heat-pump' });
  });

  it('calls onChange when home size slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/home size/i), { target: { value: '2000' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, homeSizeSqft: 2000 });
  });

  it('calls onChange when people count decremented', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/decrease number of people/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, numPeople: 1 });
  });

  it('numPeople does not go below 1', () => {
    render_({ ...DEFAULT_ENERGY, numPeople: 1 });
    fireEvent.click(screen.getByLabelText(/decrease number of people/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, numPeople: 1 });
  });

  it('calls onChange when people count incremented', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/increase number of people/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, numPeople: 3 });
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /next: food/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /go back to transport/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('selected electricity source has aria-pressed=true', () => {
    render_();
    expect(screen.getByRole('button', { name: /standard grid/i })).toHaveAttribute('aria-pressed', 'true');
  });
});

// ── DietStep ────────────────────────────────────────────────

const DEFAULT_DIET: DietData = {
  dietType: 'omnivore',
  localFoodPercent: 30,
  foodWasteLevel: 'medium',
};

describe('DietStep', () => {
  const onNext = vi.fn();
  const onBack = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_DIET) =>
    render(<DietStep data={data} onChange={onChange} onNext={onNext} onBack={onBack} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /how do you eat/i })).toBeInTheDocument();
  });

  it('renders all diet types', () => {
    render_();
    const types = ['Vegan', 'Vegetarian', 'Pescatarian', 'Flexitarian', 'Omnivore', 'Meat-heavy'];
    for (const t of types) {
      expect(screen.getByRole('button', { name: new RegExp(t, 'i') })).toBeInTheDocument();
    }
  });

  it('renders all waste levels', () => {
    render_();
    expect(screen.getByRole('button', { name: /very little/i })).toBeInTheDocument();
    // accessible name includes the description text
    expect(screen.getByRole('button', { name: /average household waste/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quite a bit/i })).toBeInTheDocument();
  });

  it('calls onChange when diet type selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /vegan/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, dietType: 'vegan' });
  });

  it('calls onChange when local food slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/how much of your food is locally grown/i), {
      target: { value: '60' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, localFoodPercent: 60 });
  });

  it('calls onChange when waste level selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /very little/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, foodWasteLevel: 'low' });
  });

  it('calls onChange for high waste level', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /quite a bit/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, foodWasteLevel: 'high' });
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /next: shopping/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /go back to home energy/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('selected diet has aria-pressed=true', () => {
    render_();
    expect(screen.getByRole('button', { name: /omnivore/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('unselected diet has aria-pressed=false', () => {
    render_();
    expect(screen.getByRole('button', { name: /vegan/i })).toHaveAttribute('aria-pressed', 'false');
  });
});

// ── ShoppingStep ────────────────────────────────────────────

const DEFAULT_SHOPPING: ShoppingData = {
  newClothingItemsPerMonth: 3,
  electronicsPerYear: 1,
  onlineOrdersPerWeek: 2,
  buySecondhand: false,
};

describe('ShoppingStep', () => {
  const onNext = vi.fn();
  const onBack = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_SHOPPING) =>
    render(<ShoppingStep data={data} onChange={onChange} onNext={onNext} onBack={onBack} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /what do you buy/i })).toBeInTheDocument();
  });

  it('calls onChange when clothing slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/new clothing items per month/i), {
      target: { value: '5' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, newClothingItemsPerMonth: 5 });
  });

  it('calls onChange when electronics + button clicked', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/increase electronics per year/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, electronicsPerYear: 2 });
  });

  it('calls onChange when electronics − button clicked', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/decrease electronics per year/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, electronicsPerYear: 0 });
  });

  it('electronics do not go below 0', () => {
    render_({ ...DEFAULT_SHOPPING, electronicsPerYear: 0 });
    fireEvent.click(screen.getByLabelText(/decrease electronics per year/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, electronicsPerYear: 0 });
  });

  it('calls onChange when online orders slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/online orders per week/i), {
      target: { value: '7' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, onlineOrdersPerWeek: 7 });
  });

  it('calls onChange when secondhand toggle clicked (off → on)', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /i regularly buy secondhand/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, buySecondhand: true });
  });

  it('calls onChange when secondhand toggle clicked (on → off)', () => {
    render_({ ...DEFAULT_SHOPPING, buySecondhand: true });
    fireEvent.click(screen.getByRole('button', { name: /i regularly buy secondhand/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, buySecondhand: false });
  });

  it('secondhand toggle has correct aria-pressed when on', () => {
    render_({ ...DEFAULT_SHOPPING, buySecondhand: true });
    expect(screen.getByRole('button', { name: /i regularly buy secondhand/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('secondhand toggle has correct aria-pressed when off', () => {
    render_();
    expect(screen.getByRole('button', { name: /i regularly buy secondhand/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows singular device label when electronics=1', () => {
    render_();
    expect(screen.getByText('device')).toBeInTheDocument();
  });

  it('shows plural devices label when electronics=2', () => {
    render_({ ...DEFAULT_SHOPPING, electronicsPerYear: 2 });
    expect(screen.getByText('devices')).toBeInTheDocument();
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /see my results/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /go back to diet/i }));
    expect(onBack).toHaveBeenCalled();
  });
});

// ── ResultsStep ─────────────────────────────────────────────

const makeResultsProps = (total: number) => ({
  transport: total * 0.4,
  energy: total * 0.25,
  diet: total * 0.25,
  shopping: total * 0.1,
  total,
  onFinish: vi.fn(),
  onBack: vi.fn(),
});

describe('ResultsStep', () => {
  it('renders footprint breakdown', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText(/footprint breakdown/i)).toBeInTheDocument();
  });

  it('renders the comparison section', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText(/how you compare/i)).toBeInTheDocument();
    expect(screen.getByText(/global average/i)).toBeInTheDocument();
    expect(screen.getByText(/us average/i)).toBeInTheDocument();
    expect(screen.getByText(/paris 2030/i)).toBeInTheDocument();
  });

  it('shows "below global average" message when tonnes < 4.8', () => {
    render(<ResultsStep {...makeResultsProps(2000)} />);
    // 2000 kg = 2 tonnes < 4.8 global average
    expect(screen.getByText(/already below the global average/i)).toBeInTheDocument();
  });

  it('shows "above global average" message when tonnes >= 4.8', () => {
    render(<ResultsStep {...makeResultsProps(9000)} />);
    // 9000 kg = 9 tonnes > 4.8 global average
    expect(screen.getByText(/biggest wins/i)).toBeInTheDocument();
  });

  it('calls onFinish when action plan button clicked', () => {
    const props = makeResultsProps(5000);
    render(<ResultsStep {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /see my action plan/i }));
    expect(props.onFinish).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    const props = makeResultsProps(5000);
    render(<ResultsStep {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /go back to shopping/i }));
    expect(props.onBack).toHaveBeenCalled();
  });

  it('renders all four categories in breakdown', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText(/transport/i)).toBeInTheDocument();
    expect(screen.getByText(/energy/i)).toBeInTheDocument();
    expect(screen.getByText(/diet/i)).toBeInTheDocument();
    expect(screen.getByText(/shopping/i)).toBeInTheDocument();
  });

  it('shows A+ grade for very low footprints', () => {
    render(<ResultsStep {...makeResultsProps(1000)} />);
    expect(screen.getByText('A+')).toBeInTheDocument();
  });

  it('shows B grade for moderate footprints (5 tonnes)', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows F grade for very high footprints (15 tonnes)', () => {
    render(<ResultsStep {...makeResultsProps(15000)} />);
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('applies forest color class for high grades', () => {
    const { container } = render(<ResultsStep {...makeResultsProps(1000)} />);
    expect(container.querySelector('.text-forest-600')).not.toBeNull();
  });

  it('applies earth color class for C grade (6-8 tonnes)', () => {
    // 7000 kg = 7 tonnes → grade C → color earth
    const { container } = render(<ResultsStep {...makeResultsProps(7000)} />);
    expect(container.querySelector('.text-earth-600')).not.toBeNull();
  });
});

// ── AssessmentFlow ───────────────────────────────────────────

describe('AssessmentFlow', () => {
  it('renders the first step (Transport) on mount', () => {
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('shows the step progress bar', () => {
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByRole('progressbar', { name: /assessment progress/i })).toBeInTheDocument();
  });

  it('shows Getting Around tab as current step on mount', () => {
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByRole('button', { name: /getting around/i })).toHaveAttribute('aria-current', 'step');
  });

  it('navigates to Energy step when Next is clicked', () => {
    renderWithTheme(<AssessmentFlow />);
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    expect(screen.getByRole('heading', { name: /what powers your home/i })).toBeInTheDocument();
  });

  it('step tab navigation back: clicking previous tab navigates back (covers i <= stepIndex branch)', () => {
    renderWithTheme(<AssessmentFlow />);
    // Advance to Energy step
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    // Home Energy step is now active (stepIndex = 1)
    expect(screen.getByRole('heading', { name: /what powers your home/i })).toBeInTheDocument();
    // Click the "Getting Around" tab (i=0 < stepIndex=1) to navigate back
    const nav = screen.getByRole('navigation', { name: /assessment steps/i });
    fireEvent.click(within(nav).getByRole('button', { name: /getting around/i }));
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('clicking a future tab (i > stepIndex) does nothing', () => {
    renderWithTheme(<AssessmentFlow />);
    // Use the step nav to scope the query away from the "Next: Home Energy" button
    const nav = screen.getByRole('navigation', { name: /assessment steps/i });
    const energyTab = within(nav).getByRole('button', { name: /home energy/i });
    fireEvent.click(energyTab);
    // Should remain on Transport step
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('calls completeAssessment when results step finishes', () => {
    renderWithTheme(<AssessmentFlow />);
    // Navigate through all steps
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: food/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: shopping/i }));
    fireEvent.click(screen.getByRole('button', { name: /see my results/i }));
    fireEvent.click(screen.getByRole('button', { name: /see my action plan/i }));
    expect(mockCompleteAssessment).toHaveBeenCalledTimes(1);
  });

  it('live estimate banner shows while not on results step', () => {
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByText(/live estimate/i)).toBeInTheDocument();
  });

  it('goBack is called when EnergyStep back button is clicked', () => {
    renderWithTheme(<AssessmentFlow />);
    // Advance to Energy step
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    expect(screen.getByRole('heading', { name: /what powers your home/i })).toBeInTheDocument();
    // Go back via EnergyStep's back button (calls goBack in AssessmentFlow)
    fireEvent.click(screen.getByRole('button', { name: /go back to transport/i }));
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });
});
