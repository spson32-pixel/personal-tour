'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const PAGE_TITLES: Record<string, string> = {
  ko: '퍼스널투어 - MBTI 기반 문화유산 여행 추천',
  en: 'Personal tour - MBTI Heritage Travel Recommendation',
};

export default function SiteTitle() {
  const { locale } = useLanguage();

  useEffect(() => {
    document.title = PAGE_TITLES[locale] ?? PAGE_TITLES.ko;
  }, [locale]);

  return null;
}
