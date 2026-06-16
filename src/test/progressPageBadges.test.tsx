import '@/test/helpers/progressPageMocks';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressPage from '@/components/progress/ProgressPage';
import { progressPageMockState, BASE_BADGES, resetProgressPageMocks } from '@/test/helpers/progressPageMocks';

describe('ProgressPage — badges', () => {
  beforeEach(resetProgressPageMocks);

  it('shows earned badges section', () => {
    render(<ProgressPage />);
    expect(screen.getByText('Earned')).toBeInTheDocument();
    expect(screen.getByText('First Step')).toBeInTheDocument();
  });

  it('shows earned date for badges', () => {
    render(<ProgressPage />);
    expect(screen.getByText('Jan 15')).toBeInTheDocument();
  });

  it('shows locked badges section', () => {
    render(<ProgressPage />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText('Know Thyself')).toBeInTheDocument();
  });

  it('shows badge counts in header', () => {
    render(<ProgressPage />);
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });

  it('shows all badge types in locked section when none earned', () => {
    progressPageMockState.badges = BASE_BADGES.map((b) => ({ ...b, earned: false, earnedDate: undefined }));
    render(<ProgressPage />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.queryByText('Earned')).not.toBeInTheDocument();
  });
});
