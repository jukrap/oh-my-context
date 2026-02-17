import { useEffect } from 'react';
import { flushAutosaveNow, subscribeAutosaveStatus } from '../../../shared/lib/storage/indexeddb-storage';
import { useRuntimeStore } from '../../../shared/model/runtime-store';

export function useAutosaveLifecycle(): void {
  const setSaveStatus = useRuntimeStore((state) => state.setSaveStatus);

  useEffect(() => {
    const unsubscribe = subscribeAutosaveStatus((status) => {
      setSaveStatus(status);
    });

    return unsubscribe;
  }, [setSaveStatus]);

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
