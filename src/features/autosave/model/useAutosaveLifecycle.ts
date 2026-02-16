import { useEffect } from 'react';
import { flushAutosaveNow, subscribeAutosaveStatus } from '../../../shared/lib/storage/indexeddb-storage';
import { useAppStore } from '../../../shared/model/store';

export function useAutosaveLifecycle(): void {
  const setSaveStatus = useAppStore((state) => state.setSaveStatus);
  const setHydrated = useAppStore((state) => state.setHydrated);

  useEffect(() => {
    const unsubscribe = subscribeAutosaveStatus((status) => {
      setSaveStatus(status);
    });

    return unsubscribe;
  }, [setSaveStatus]);

  useEffect(() => {
    void Promise.resolve(useAppStore.persist.rehydrate()).then(() => {
      setHydrated(true);
    });
  }, [setHydrated]);

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        void flushAutosaveNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
