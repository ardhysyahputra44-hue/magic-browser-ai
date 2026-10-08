import type { BrowserState } from '../../types/models';
import { loadState, persistState } from '../../store/appStore';

export interface StorageService {
  load(): BrowserState;
  save(state: BrowserState): void;
  clear(): void;
}

export const storageService: StorageService = {
  load: loadState,
  save: persistState,
  clear() { localStorage.removeItem('magic-browser-ai:state:v2'); }
};
