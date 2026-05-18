'use client';

import Link from 'next/link';
import { MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">{t('header.brand')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/test"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t('nav.test')}
            </Link>
            <Link
              href="/result"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t('nav.result')}
            </Link>
          </nav>

          {/* Right side: language toggle + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* 언어 토글 */}
            <div className="flex items-center rounded-full border border-slate-200 overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setLocale('ko')}
                className={`px-3 py-1.5 transition-colors ${
                  locale === 'ko'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                KO
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 transition-colors ${
                  locale === 'en'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('zh')}
                className={`px-3 py-1.5 transition-colors ${
                  locale === 'zh'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                中文
              </button>
            </div>

            <Button asChild>
              <Link href="/test">{t('nav.cta')}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-900" />
            ) : (
              <Menu className="h-6 w-6 text-slate-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/test"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.test')}
              </Link>
              <Link
                href="/result"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.result')}
              </Link>
              {/* 모바일 언어 토글 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{t('header.langLabel')}</span>
                <div className="flex items-center rounded-full border border-slate-200 overflow-hidden text-xs font-semibold">
                  <button
                    onClick={() => setLocale('ko')}
                    className={`px-3 py-1.5 transition-colors ${
                      locale === 'ko' ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    KO
                  </button>
                  <button
                    onClick={() => setLocale('en')}
                    className={`px-3 py-1.5 transition-colors ${
                      locale === 'en' ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLocale('zh')}
                    className={`px-3 py-1.5 transition-colors ${
                      locale === 'zh' ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/test" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.cta')}
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
