import type { AppLanguage } from './messages';

export interface LocalizedValue<T> {
  en: T;
  ko: T;
}

export function localize<T>(
  language: AppLanguage,
  value: LocalizedValue<T>,
): T {
  return value[language] ?? value.en;
}
