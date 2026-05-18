'use client';

import Link from 'next/link';
import { MapPin, Heart, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t bg-slate-950 text-slate-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{t('footer.brand')}</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              {t('footer.brandDesc')}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3 w-3" />
              {t('footer.curation')}
            </div>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">{t('footer.service')}</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: t('nav.home') },
                { href: '/test', label: t('nav.test') },
                { href: '/result', label: t('nav.result') },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">{t('footer.regions')}</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/?region=seoul#recommendations', key: 'seoul' },
                { href: '/?region=gyeonggi#recommendations', key: 'gyeonggi' },
                { href: '/?region=gangwon#recommendations', key: 'gangwon' },
                { href: '/?region=gyeongsang#recommendations', key: 'gyeongsang' },
                { href: '/?region=jeolla#recommendations', key: 'jeolla' },
                { href: '/?region=jeju#recommendations', key: 'jeju' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {t(`regions.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">{t('footer.info')}</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-slate-500">{t('footer.officialInfo')}</li>
              <li className="text-sm text-slate-500">{t('footer.unescoData')}</li>
              <li className="text-sm text-slate-500">{t('footer.aiCuration')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-600">
              {t('footer.copyright')}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              Made with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> {t('footer.forHeritage')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
