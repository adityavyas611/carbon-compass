import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

describe('useFocusTrap', () => {
  it('calls onEscape when Escape is pressed while active', () => {
    const onEscape = vi.fn();
    const container = document.createElement('div');
    const button = document.createElement('button');
    container.appendChild(button);
    document.body.appendChild(container);

    const containerRef = { current: container };
    renderHook(() => useFocusTrap({ active: true, containerRef, onEscape }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onEscape).toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it('does not attach listeners when inactive', () => {
    const onEscape = vi.fn();
    const containerRef = { current: document.createElement('div') };
    renderHook(() => useFocusTrap({ active: false, containerRef, onEscape }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onEscape).not.toHaveBeenCalled();
  });
});
