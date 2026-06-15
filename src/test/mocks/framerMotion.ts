import { vi } from 'vitest';
import React from 'react';

const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants', 'custom',
  'layout', 'layoutId', 'whileHover', 'whileTap', 'whileFocus', 'whileInView',
]);

export function createFramerMotionMock() {
  const motionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(
      ({ children, variants, custom, ...props }, ref) => {
        if (variants && typeof variants === 'object') {
          const v = variants as { enter?: (d: number) => unknown; exit?: (d: number) => unknown };
          const dir = typeof custom === 'number' ? custom : 1;
          if (typeof v.enter === 'function') v.enter(dir);
          if (typeof v.exit === 'function') v.exit(dir);
        }
        return React.createElement(
          tag,
          {
            ...Object.fromEntries(
              Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key))
            ),
            ref,
          },
          children
        );
      }
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: vi.fn(() => false),
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  };
}

/** Non-forwarding mock for focus-trap null-ref tests. */
export function createFramerMotionMockNoRef() {
  const motionComponent = (tag: string) =>
    ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement(
        tag,
        Object.fromEntries(Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key))),
        children
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: vi.fn(() => false),
  };
}
