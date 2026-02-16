import localforage from 'localforage';
import type { StateStorage } from 'zustand/middleware';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type AutosaveListener = (status: AutosaveStatus) => void;

const storage = localforage.createInstance({
  name: 'oh-my-context',
  storeName: 'workspace',
});

const listeners = new Set<AutosaveListener>();

let timer: ReturnType<typeof setTimeout> | null = null;
let pendingWrite: { name: string; value: string } | null = null;

function notify(status: AutosaveStatus): void {
  listeners.forEach((listener) => {
    listener(status);
  });
}

async function flushPendingWrite(): Promise<void> {
  if (!pendingWrite) {
    return;
  }

  const target = pendingWrite;
  pendingWrite = null;

  try {
    await storage.setItem(target.name, target.value);
    notify('saved');
  } catch {
    notify('error');
  }
}

export const indexedDbStateStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await storage.getItem<string>(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    pendingWrite = { name, value };
    notify('saving');

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      void flushPendingWrite();
    }, 800);
  },
  removeItem: async (name: string): Promise<void> => {
    await storage.removeItem(name);
  },
};

export function subscribeAutosaveStatus(listener: AutosaveListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function flushAutosaveNow(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  await flushPendingWrite();
}
