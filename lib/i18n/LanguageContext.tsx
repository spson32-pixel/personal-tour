'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'ko' | 'en' | 'zh' | 'ja';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved === 'ko' || saved === 'en' || saved === 'zh' || saved === 'ja') setLocaleState(saved);
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem('locale', next);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** 언어 상태(locale + setLocale)만 필요한 컴포넌트에서 사용 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
