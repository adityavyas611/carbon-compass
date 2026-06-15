import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await import('./mocks/framerMotion');
  return createFramerMotionMock();
});

vi.mock('recharts', async () => {
  const { createRechartsMock } = await import('./mocks/recharts');
  return createRechartsMock();
});
