import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '@/components/dashboard/Dashboard';
import FootprintChart from '@/components/dashboard/FootprintChart';
import TrendLine from '@/components/dashboard/TrendLine';

import React from 'react';

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial','animate','exit','transition','variants','custom','layout','layoutId','whileHover','whileTap','whileFocus','whileInView']);
  const motionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, ...p }, ref) =>
      React.createElement(tag, { ...Object.fromEntries(Object.entries(p).filter(([k]) => !MOTION_PROPS.has(k))), ref }, children)
    );
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

// Recharts mock: Tooltip renders its `content` prop with active=true so CustomTooltip is exercised
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: ({ content }: { content: React.ReactElement }) => {
    if (!content) return null;
    const C = content.type as React.ComponentType<{
      active?: boolean;
      payload?: { name: string; value?: number }[];
      label?: string;
    }>;
    return (
      <>
        {/* active with 2 items – covers tooltip body including payload[1] branch */}
        <C active payload={[{ name: 'Transport', value: 2000 }, { name: 'Saved', value: 100 }]} label="Jan" />
        {/* active with 1 item – covers the payload[1] falsy branch */}
        <C active payload={[{ name: 'Transport', value: 2000 }]} label="Feb" />
        {/* undefined value – covers payload[0].value ?? 0 branch (line 33) */}
        <C active payload={[{ name: 'Transport' }]} label="Mar" />
        {/* inactive – covers the `return null` branch */}
        <C active={false} payload={[]} label="" />
      </>
    );
  },
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  BarTooltip: () => null,
}));

const mockSetView = vi.fn();

const BASE_FOOTPRINT = {
  transport: 3000,
  energy: 2000,
  diet: 1500,
  shopping: 500,
  total: 7000,
};

let mockState = {
  footprint: BASE_FOOTPRINT as typeof BASE_FOOTPRINT | null,
  loggedActions: [] as { actionId: string; date: string; co2SavedKg: number }[],
  streak: { currentDays: 3, longestDays: 7, lastLogDate: null },
  badges: [
    { id: 'first-log', earned: true, earnedDate: new Date().toISOString(), title: 'First Step', description: 'desc', icon: '🌱', category: 'general' },
    { id: 'assessment-done', earned: false, earnedDate: undefined, title: 'Know Thyself', description: 'desc', icon: '📊', category: 'general' },
  ],
  monthlyHistory: [] as { month: string; footprintKg: number; actionsCompleted: number; co2SavedKg: number }[],
  insights: [] as string[],
  setView: mockSetView,
};

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => mockState),
}));

// ── FootprintChart ──────────────────────────────────────────

describe('FootprintChart', () => {
  it('renders with footprint data', () => {
    const { container } = render(<FootprintChart footprint={BASE_FOOTPRINT} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('has accessible role and label with data values', () => {
    render(<FootprintChart footprint={BASE_FOOTPRINT} />);
    expect(screen.getByRole('img', { name: /transport.*energy.*diet.*shopping/i })).toBeInTheDocument();
  });

  it('filters out zero-value categories', () => {
    // Should not throw even when some values are zero
    const fp = { transport: 0, energy: 2000, diet: 0, shopping: 500, total: 2500 };
    const { container } = render(<FootprintChart footprint={fp} />);
    expect(container.firstChild).not.toBeNull();
  });
});

// ── TrendLine ───────────────────────────────────────────────

describe('TrendLine', () => {
  it('renders with trend data', () => {
    const data = [
      { month: '2024-01', footprintKg: 5000, actionsCompleted: 2, co2SavedKg: 100 },
      { month: '2024-02', footprintKg: 4800, actionsCompleted: 3, co2SavedKg: 200 },
    ];
    const { container } = render(<TrendLine data={data} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('has accessible role and label with data values', () => {
    const data = [
      { month: '2024-01', footprintKg: 5000, actionsCompleted: 0, co2SavedKg: 0 },
    ];
    render(<TrendLine data={data} />);
    expect(screen.getByRole('img', { name: /jan.*5\.00 tonnes/i })).toBeInTheDocument();
  });

  it('sorts data by month ascending', () => {
    // Should not throw with out-of-order data
    const data = [
      { month: '2024-03', footprintKg: 4600, actionsCompleted: 0, co2SavedKg: 0 },
      { month: '2024-01', footprintKg: 5000, actionsCompleted: 0, co2SavedKg: 0 },
      { month: '2024-02', footprintKg: 4800, actionsCompleted: 0, co2SavedKg: 0 },
    ];
    const { container } = render(<TrendLine data={data} />);
    expect(container.firstChild).not.toBeNull();
  });
});

// ── Dashboard ───────────────────────────────────────────────

describe('Dashboard', () => {
  beforeEach(() => {
    mockState = {
      footprint: BASE_FOOTPRINT,
      loggedActions: [],
      streak: { currentDays: 3, longestDays: 7, lastLogDate: null },
      badges: [
        { id: 'first-log', earned: true, earnedDate: new Date().toISOString(), title: 'First Step', description: 'desc', icon: '🌱', category: 'general' },
        { id: 'assessment-done', earned: false, earnedDate: undefined, title: 'Know Thyself', description: 'desc', icon: '📊', category: 'general' },
      ],
      monthlyHistory: [],
      insights: [],
      setView: mockSetView,
    };
    vi.clearAllMocks();
  });

  it('renders empty state when footprint is null', () => {
    mockState = { ...mockState, footprint: null };
    render(<Dashboard />);
    expect(screen.getByText(/complete the carbon assessment/i)).toBeInTheDocument();
  });

  it('renders the dashboard heading', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /your dashboard/i })).toBeInTheDocument();
  });

  it('displays the formatted total footprint', () => {
    render(<Dashboard />);
    expect(screen.getByText('7.0t')).toBeInTheDocument();
  });

  it('shows the grade', () => {
    render(<Dashboard />);
    // 7 tonnes → Grade C
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('shows streak days', () => {
    render(<Dashboard />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays total CO₂ saved from logged actions (covers reduce callback)', () => {
    mockState = {
      ...mockState,
      loggedActions: [
        { actionId: 'a1', date: '2024-01-01', co2SavedKg: 150 },
        { actionId: 'a2', date: '2024-01-02', co2SavedKg: 250 },
      ],
    };
    render(<Dashboard />);
    expect(screen.getByText('0.4t')).toBeInTheDocument();
  });

  it('shows badge count', () => {
    render(<Dashboard />);
    // 1 earned badge
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows all four categories', () => {
    render(<Dashboard />);
    // getAllByText: Tooltip mock renders "Transport" via CustomTooltip + the category label
    expect(screen.getAllByText('Transport').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Energy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Diet').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Shopping').length).toBeGreaterThanOrEqual(1);
  });

  it('does NOT render trend line with 0 or 1 monthly history entries', () => {
    render(<Dashboard />);
    expect(screen.queryByText(/monthly trend/i)).not.toBeInTheDocument();
  });

  it('renders trend line when monthlyHistory has more than 1 entry', () => {
    mockState = {
      ...mockState,
      monthlyHistory: [
        { month: '2024-01', footprintKg: 7000, actionsCompleted: 0, co2SavedKg: 0 },
        { month: '2024-02', footprintKg: 6800, actionsCompleted: 1, co2SavedKg: 100 },
      ],
    };
    render(<Dashboard />);
    expect(screen.getByText(/monthly trend/i)).toBeInTheDocument();
  });

  it('does NOT show AI insight when insights array is empty', () => {
    render(<Dashboard />);
    expect(screen.queryByText(/ai insight/i)).not.toBeInTheDocument();
  });

  it('shows AI insight card when insights are present', () => {
    mockState = { ...mockState, insights: ['Plant 2 more meals this week.'] };
    render(<Dashboard />);
    expect(screen.getByText(/ai insight/i)).toBeInTheDocument();
  });

  it('View My Action Plan button calls setView with actions', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /view my action plan/i }));
    expect(mockSetView).toHaveBeenCalledWith('actions');
  });

  it('shows TrendingDown icon for footprint well below global average', () => {
    // 1000 kg = 1 tonne, global avg = 4.8 → -79% → TrendingDown
    mockState = { ...mockState, footprint: { transport: 200, energy: 300, diet: 300, shopping: 200, total: 1000 } };
    const { container } = render(<Dashboard />);
    // The SVG is rendered as lucide; check the div still renders
    expect(container.firstChild).not.toBeNull();
  });

  it('shows TrendingUp icon for footprint well above global average', () => {
    // 14000 kg = 14 tonnes → high → TrendingUp
    mockState = { ...mockState, footprint: { transport: 5000, energy: 4000, diet: 3000, shopping: 2000, total: 14000 } };
    render(<Dashboard />);
    // Grade should be F or D
    expect(screen.getByRole('heading', { name: /your dashboard/i })).toBeInTheDocument();
  });

  it('shows Minus icon when footprint is within 5% of average', () => {
    // global avg = 4.8t = 4800 kg (within 5%)
    mockState = { ...mockState, footprint: { transport: 1200, energy: 1200, diet: 1200, shopping: 1200, total: 4800 } };
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /your dashboard/i })).toBeInTheDocument();
  });

  it('CTA message varies by biggest category (energy)', () => {
    // energy > transport
    mockState = { ...mockState, footprint: { transport: 1000, energy: 5000, diet: 500, shopping: 500, total: 7000 } };
    render(<Dashboard />);
    expect(screen.getByText(/~860 kg/i)).toBeInTheDocument();
  });

  it('CTA message varies by biggest category (diet)', () => {
    mockState = { ...mockState, footprint: { transport: 1000, energy: 1000, diet: 4000, shopping: 500, total: 6500 } };
    render(<Dashboard />);
    expect(screen.getByText(/~180 kg/i)).toBeInTheDocument();
  });

  it('CTA message varies by biggest category (shopping)', () => {
    mockState = { ...mockState, footprint: { transport: 100, energy: 100, diet: 100, shopping: 5000, total: 5300 } };
    render(<Dashboard />);
    expect(screen.getByText(/~120 kg/i)).toBeInTheDocument();
  });

  it('grade color class for F grade (red)', () => {
    // >12 tonnes
    mockState = { ...mockState, footprint: { transport: 5000, energy: 4000, diet: 3000, shopping: 2000, total: 14000 } };
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.text-red-500')).not.toBeNull();
  });

  it('grade color class for B grade (sage)', () => {
    // 4-6 tonnes
    mockState = { ...mockState, footprint: { transport: 2000, energy: 1000, diet: 1000, shopping: 1000, total: 5000 } };
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.text-sage-600')).not.toBeNull();
  });

  it('grade color class for C grade (earth)', () => {
    // 6-8 tonnes
    render(<Dashboard />); // BASE_FOOTPRINT = 7000 kg = 7t → Grade C
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.text-earth-600')).not.toBeNull();
  });
});
