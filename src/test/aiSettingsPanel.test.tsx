import '@/test/helpers/commonMocks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AISettingsPanel from '@/components/common/AISettingsPanel';
import { generateInsight, canMakeAiRequest } from '@/services/aiService';
import { mockCommonState, mockAddInsight, mockResetAll } from '@/test/helpers/commonMocks';

describe('AISettingsPanel', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    mockCommonState.footprint = null;
    mockCommonState.insights = [];
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
    mockCommonState.footprint = { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 };
    mockCommonState.loggedActions = [{ actionId: 'a1', date: '2024-01-01', co2SavedKg: 100 }];
    mockCommonState.insights = [];
    render(<AISettingsPanel isOpen onClose={onClose} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /generate new insight/i }));
    });
    expect(mockAddInsight).toHaveBeenCalledWith('Great insight about transport!');
  });

  it('shows error alert when generateInsight rejects', async () => {
    vi.mocked(generateInsight).mockRejectedValueOnce(new Error('API error'));
    mockCommonState.footprint = { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 };
    mockCommonState.insights = [];
    render(<AISettingsPanel isOpen onClose={onClose} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /generate new insight/i }));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders existing insights from state', () => {
    mockCommonState.footprint = { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 };
    mockCommonState.insights = ['Reduce your meat consumption to save 180 kg CO₂e per year.'];
    render(<AISettingsPanel isOpen onClose={onClose} />);
    expect(screen.getByText('Reduce your meat consumption to save 180 kg CO₂e per year.')).toBeInTheDocument();
  });

  it('shows rate limit error when canMakeAiRequest returns false', async () => {
    vi.mocked(canMakeAiRequest).mockReturnValue(false);
    mockCommonState.footprint = { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 };
    mockCommonState.insights = [];
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
    if (!backdrop) throw new Error('expected backdrop element');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
