import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ThemeProvider } from '@/components/common/ThemeProvider';

export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, options);
}
