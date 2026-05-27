// 상태(locale) 관련은 LanguageContext에서, 번역 텍스트(t)는 여기서 제공
export { LanguageProvider, useLanguage } from './LanguageContext';
export type { Locale } from './LanguageContext';

import { useLanguage } from './LanguageContext';
import ko from './ko.json';
import en from './en.json';
import zh from './zh.json';
import ja from './ja.json';

const DICTIONARIES = { ko, en, zh, ja } as const;

/**
 * 번역 훅 - 텍스트가 필요한 모든 컴포넌트에서 사용
 *
 * 기본:      t('hero.badge')
 * 변수 치환: t('result.recsSub', { mbti: 'INFP' })
 *            → JSON에서 "{mbti} 성향에 맞는..."을 "INFP 성향에 맞는..."으로 치환
 */
export function useTranslation() {
  const { locale, setLocale } = useLanguage();

  function t(key: string, vars?: Record<string, string>): string {
    const dict = DICTIONARIES[locale] as Record<string, unknown>;
    const raw = key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
      return undefined;
    }, dict);

    let result = typeof raw === 'string' ? raw : key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        result = result.replaceAll(`{${k}}`, v);
      });
    }

    return result;
  }

  return { t, locale, setLocale };
}
