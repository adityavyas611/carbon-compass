import { beforeEach } from 'vitest';
import { useCarbonStore } from '@/store/carbonStore';

export const store = () => useCarbonStore.getState();

export function resetCarbonStore() {
  store().resetAll();
}

export function setupCarbonStoreTests() {
  beforeEach(() => resetCarbonStore());
}
