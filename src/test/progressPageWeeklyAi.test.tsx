import '@/test/helpers/progressPageMocks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProgressPage from '@/components/progress/ProgressPage';
import { generateWeeklyReport, canMakeAiRequest } from '@/services/aiService';
import { progressPageMockState, mockSetWeeklyReport, resetProgressPageMocks } from '@/test/helpers/progressPageMocks';

describe('ProgressPage — weekly AI summary', () => {
  beforeEach(() => {
    resetProgressPageMocks();
    vi.mocked(generateWeeklyReport).mockResolvedValue('Great week! You saved 150 kg.');
    vi.mocked(canMakeAiRequest).mockReturnValue(true);
  });

  it('shows weekly AI summary section when footprint exists', () => {
    render(<ProgressPage />);
    expect(screen.getByRole('heading', { name: /weekly ai summary/i })).toBeInTheDocument();
    expect(screen.getByText(/generate a personalised summary/i)).toBeInTheDocument();
  });

  it('generates weekly report on button click', async () => {
    render(<ProgressPage />);
    fireEvent.click(screen.getByRole('button', { name: /generate weekly report/i }));
    await waitFor(() => {
      expect(generateWeeklyReport).toHaveBeenCalled();
      expect(mockSetWeeklyReport).toHaveBeenCalledWith('Great week! You saved 150 kg.');
    });
  });

  it('shows stored weekly report', () => {
    progressPageMockState.weeklyReport = 'You had an amazing sustainable week!';
    render(<ProgressPage />);
    expect(screen.getByText('You had an amazing sustainable week!')).toBeInTheDocument();
  });

  it('shows error alert when weekly report generation fails', async () => {
    vi.mocked(generateWeeklyReport).mockRejectedValueOnce(new Error('API error'));
    render(<ProgressPage />);
    fireEvent.click(screen.getByRole('button', { name: /generate weekly report/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unable to generate weekly report/i);
    });
  });

  it('shows rate-limit message when canMakeAiRequest returns false', async () => {
    vi.mocked(canMakeAiRequest).mockReturnValue(false);
    render(<ProgressPage />);
    fireEvent.click(screen.getByRole('button', { name: /generate weekly report/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/wait a few seconds/i);
    });
  });
});
