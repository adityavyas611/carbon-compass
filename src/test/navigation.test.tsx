import '@/test/helpers/commonMocks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '@/components/common/Navigation';
import { mockCommonState, mockSetView } from '@/test/helpers/commonMocks';

describe('Navigation', () => {
  beforeEach(() => {
    mockCommonState.currentView = 'dashboard';
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
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('closing settings panel invokes onClose callback', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: /open ai settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /close settings/i, hidden: true }));
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });
});
