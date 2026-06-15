import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { ThemeProvider } from '@/components/common/ThemeProvider';

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
  it('shows theme toggle during onboarding', async () => {
    const { default: AssessmentFlow } = await import('@/components/onboarding/AssessmentFlow');
    const { renderWithTheme } = await import('@/test/test-utils');
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeInTheDocument();
  });
});
