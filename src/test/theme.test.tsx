import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import AssessmentFlow from '@/components/onboarding/AssessmentFlow';
import { renderWithTheme } from '@/test/test-utils';

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: () => ({ completeAssessment: vi.fn() }),
}));

describe('ThemeToggle', () => {
  it('renders dark mode toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('toggles to light mode label after click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('AssessmentFlow dark mode', () => {
  it('shows theme toggle during onboarding', () => {
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeInTheDocument();
  });
});
