import { useCallback } from 'react';
import type { TranslationKey } from './messages';
import { translateMessage } from './messages';
import { useAppStore } from '../../model/store';

export function useI18n() {
  const language = useAppStore((state) => state.settings.language);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translateMessage(language, key, params),
    [language],
  );

  return {
    language,
    t,
  };
}
