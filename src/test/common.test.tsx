import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InsightCard from '@/components/common/InsightCard';
import Navigation from '@/components/common/Navigation';
import AISettingsPanel from '@/components/common/AISettingsPanel';
import { generateInsight, canMakeAiRequest } from '@/utils/aiInsights';

import React from 'react';

// ── Framer Motion mock ──────────────────────────────────────
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
    useAnimation: () => ({ start: () => {} }),
  };
});

// ── Store mock ──────────────────────────────────────────────
const mockSetView = vi.fn();
const mockAddInsight = vi.fn();
const mockResetAll = vi.fn();

let mockState = {
  currentView: 'dashboard' as const,
  footprint: null as null | { transport: number; energy: number; diet: number; shopping: number; total: number },
  loggedActions: [] as { actionId: string; date: string; co2SavedKg: number }[],
  streak: { currentDays: 3, longestDays: 5, lastLogDate: null },
  insights: [] as string[],
  setView: mockSetView,
  addInsight: mockAddInsight,
  resetAll: mockResetAll,
};

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => mockState),
}));

vi.mock('@/utils/aiInsights', () => ({
  generateInsight: vi.fn().mockRejectedValue(new Error('API error')),
  canMakeAiRequest: vi.fn().mockReturnValue(true),
}));

vi.mock('@/utils/actions', () => ({
  ALL_ACTIONS: [
    { id: 'a1', actionId: 'a1', category: 'transport', co2SavedKg: 100, title: 'Walk more', description: '', tips: [], difficulty: 'Easy', icon: '🚶' },
  ],
}));

// ── InsightCard ─────────────────────────────────────────────

describe('InsightCard', () => {
  it('renders insight text', () => {
    render(<InsightCard insight="Switch to a plant-based diet" />);
    expect(screen.getByText('Switch to a plant-based diet')).toBeInTheDocument();
  });

  it('renders AI Insight label', () => {
    render(<InsightCard insight="Some insight" />);
    expect(screen.getByText('AI Insight')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading=true', () => {
    render(<InsightCard insight="" loading />);
    expect(screen.getByRole('status', { name: /generating ai insight/i })).toBeInTheDocument();
  });

  it('renders AI Insight label in loading state too', () => {
    render(<InsightCard insight="" loading />);
    expect(screen.getByText('AI Insight')).toBeInTheDocument();
  });

  it('does not show skeleton when not loading', () => {
    const { container } = render(<InsightCard insight="Real insight" />);
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });
});

// ── Navigation ──────────────────────────────────────────────

describe('Navigation', () => {
  beforeEach(() => {
    mockState = { ...mockState, currentView: 'dashboard' };
    vi.clearAllMocks();
  });

  it('renders the nav element with accessible label', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders all four nav items', () => {
    render(<Navigation />);
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tracker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /progress/i })).toBeInTheDocument();
  });

  it('renders the settings button', () => {
    render(<Navigation />);
    expect(screen.getByRole('button', { name: /open ai settings/i })).toBeInTheDocument();
  });

  it('active view button has aria-current=page', () => {
    render(<Navigation />);
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute('aria-current', 'page');
  });

  it('inactive view buttons do not have aria-current', () => {
    render(<Navigation />);
    expect(screen.getByRole('button', { name: /actions/i })).not.toHaveAttribute('aria-current');
  });

  it('clicking a nav item calls setView', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: /actions/i }));
    expect(mockSetView).toHaveBeenCalledWith('actions');
  });

  it('clicking settings opens the AI settings panel', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: /open ai settings/i }));
    // Panel should be rendered (dialog)
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('closing settings panel invokes onClose callback (line 59)', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: /open ai settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /close settings/i, hidden: true }));
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });
});

// ── AISettingsPanel ─────────────────────────────────────────

describe('AISettingsPanel', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    mockState = { ...mockState, footprint: null, insights: [] };
    vi.mocked(canMakeAiRequest).mockReturnValue(true);
    vi.clearAllMocks();
  });

  it('does not render the dialog when isOpen=false', () => {
    render(<AISettingsPanel isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when isOpen=true', () => {
    render(<AISettingsPanel isOpen onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the AI insights heading', () => {
    render(<AISettingsPanel isOpen onClose={onClose} />);
    expect(screen.getByRole('heading', { name: 'AI Insights' })).toBeInTheDocument();
  });

  it('close button calls onClose', () => {
    render(<AISettingsPanel isOpen onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close settings/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('pressing Escape calls onClose', () => {
    render(<AISettingsPanel isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows reset confirmation when reset button clicked', () => {
    render(<AISettingsPanel isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('Reset all data'));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls resetAll when reset confirmed', () => {
    render(<AISettingsPanel isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('Reset all data'));
    fireEvent.click(screen.getByRole('button', { name: /yes, reset/i }));
    expect(mockResetAll).toHaveBeenCalled();
  });

  it('cancel reset hides the confirmation', () => {
    render(<AISettingsPanel isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('Reset all data'));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it('calls addInsight on successful generateInsight', async () => {
    vi.mocked(generateInsight).mockResolvedValueOnce('Great insight about transport!');
    mockState = {
      ...mockState,
      footprint: { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 },
      loggedActions: [{ actionId: 'a1', date: '2024-01-01', co2SavedKg: 100 }],
      insights: [],
    };
    render(<AISettingsPanel isOpen onClose={onClose} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /generate new insight/i }));
    });
    expect(mockAddInsight).toHaveBeenCalledWith('Great insight about transport!');
  });

  it('shows error alert when generateInsight rejects', async () => {
    vi.mocked(generateInsight).mockRejectedValueOnce(new Error('API error'));
    mockState = {
      ...mockState,
      footprint: { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 },
      insights: [],
    };
    render(<AISettingsPanel isOpen onClose={onClose} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /generate new insight/i }));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders existing insights from state', () => {
    mockState = {
      ...mockState,
      footprint: { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 },
      insights: ['Reduce your meat consumption to save 180 kg CO₂e per year.'],
    };
    render(<AISettingsPanel isOpen onClose={onClose} />);
    expect(screen.getByText('Reduce your meat consumption to save 180 kg CO₂e per year.')).toBeInTheDocument();
  });

  it('shows rate limit error when canMakeAiRequest returns false', async () => {
    vi.mocked(canMakeAiRequest).mockReturnValue(false);
    mockState = {
      ...mockState,
      footprint: { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 },
      insights: [],
    };
    render(<AISettingsPanel isOpen onClose={onClose} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /generate new insight/i }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/wait a few seconds/i);
  });

  it('backdrop click calls onClose', () => {
    const { container } = render(<AISettingsPanel isOpen onClose={onClose} />);
    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });
});
