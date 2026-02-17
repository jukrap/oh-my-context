import { create } from 'zustand';
import type { AutosaveStatus } from '../lib/storage/indexeddb-storage';

interface RuntimeState {
  saveStatus: AutosaveStatus;
  lastSavedAt: number | null;
  hydrated: boolean;
  setSaveStatus: (status: AutosaveStatus) => void;
  setHydrated: (value: boolean) => void;
}

export const useRuntimeStore = create<RuntimeState>((set, get) => ({
  saveStatus: 'idle',
  lastSavedAt: null,
  hydrated: false,
  setSaveStatus: (status) => {
    if (get().saveStatus === status) {
      return;
    }

    set((state) => ({
      saveStatus: status,
      lastSavedAt: status === 'saved' ? Date.now() : state.lastSavedAt,
    }));
  },
  setHydrated: (value) => {
    if (get().hydrated === value) {
      return;
    }

    set({ hydrated: value });
  },
}));
