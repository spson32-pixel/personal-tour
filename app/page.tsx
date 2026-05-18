'use client';

import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  Compass,
  Heart,
  ArrowRight,
  Brain,
  TreePine,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeritageCard from '@/components/heritage/HeritageCard';
import { getFeaturedHeritages, getAllHeritages } from '@/lib/recommendation';
import { useTranslation } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { getPlacePhoto } from '@/lib/placePhoto';

/** 히어로 섹션용 - 장소 이름으로 Google 사진을 가져오는 단순 이미지 컴포넌트 */
function HeroPlaceImage({
  name,
  city,
  alt,
  className,
}: {
  name: string;
  city: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    getPlacePhoto(name, city).then(url => { if (url) setSrc(url); });
  }, [name, city]);

  return (
    <img
      src={src ?? undefined}
      alt={alt}
      className={className}
      loading="lazy"
      style={!src ? { opacity: 0 } : undefined}
    />
  );
}

const REGION_EMOJI: Record<string, string> = {
  seoul: '🏯',
  gyeonggi: '🏰',
  gangwon: '🏔️',
  chungcheong: '⛩️',
  jeolla: '🌿',
  gyeongsang: '🛕',
  jeju: '🌊',
};

export default function Home() {
  const { t } = useTranslation();
  const featuredHeritages = getFeaturedHeritages(6);
  const allHeritages = getAllHeritages();

  const regionStats = allHeritages.reduce((acc, h) => {
    acc[h.region] = (acc[h.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 푸터 지역 링크(/?region=xxx#recommendations)로 진입 시 활성 지역 읽기
  const [activeRegion, setActiveRegion] = useState('');
  useEffect(() => {
    const region = new URLSearchParams(window.location.search).get('region');
    if (region) setActiveRegion(region);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* ===== Hero Section ===== */}
        <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute inset-0 hero-pattern" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-white/90">{t('hero.badge')}</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                    {t('hero.titleLine1')}
                    <br />
                    <span className="text-amber-400">{t('hero.titleHighlight')}</span>
                    {t('hero.titleSuffix')}
                    <br />
                    {t('hero.titleLine3')}
                  </h1>

                  <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                    {t('hero.description')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-400 text-white text-lg px-8 btn-shine shadow-lg shadow-amber-500/30"
                  >
                    <Link href="/test">
                      {t('hero.btnStart')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="border border-white/30 text-white hover:bg-white/10 hover:text-white text-lg backdrop-blur-sm"
                  >
                    <Link href="/heritage">
                      <Compass className="mr-2 h-5 w-5" />
                      {t('hero.btnBrowse')}
                    </Link>
                  </Button>
                </div>

                <div className="flex gap-8 pt-4 border-t border-white/10">
                  {[
                    { value: '200+', label: t('stats.heritages') },
                    { value: '16',   label: t('stats.mbtiTypes') },
                    { value: '7',    label: t('stats.regions') },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl font-bold text-amber-400">{stat.value}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image grid */}
              <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in-right">
                <div className="space-y-4">
                  <div className="relative h-52 rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                    <HeroPlaceImage
                      name="경복궁"
                      city="서울 종로구"
                      alt={t('hero.imgGyeongbokgung')}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-sm font-medium drop-shadow">{t('hero.imgGyeongbokgung')}</span>
                    </div>
                  </div>
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                    <HeroPlaceImage
                      name="해인사"
                      city="경상남도 합천군"
                      alt={t('hero.imgHaeinsa')}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-sm font-medium drop-shadow">{t('hero.imgHaeinsa')}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                    <HeroPlaceImage
                      name="종묘"
                      city="서울 종로구"
                      alt={t('hero.imgJongmyo')}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-sm font-medium drop-shadow">{t('hero.imgJongmyo')}</span>
                    </div>
                  </div>
                  <div className="relative h-52 rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                    <HeroPlaceImage
                      name="성산일출봉"
                      city="제주시"
                      alt={t('hero.imgSeongsan')}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-sm font-medium drop-shadow">{t('hero.imgSeongsan')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs tracking-widest uppercase">scroll</span>
            <div className="w-0.5 h-8 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </section>

        {/* ===== How It Works Section ===== */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 text-amber-600 border-amber-200 bg-amber-50">
                {t('howItWorks.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('howItWorks.titleLine1')}<br />{t('howItWorks.titleLine2')}
              </h2>
              <p className="text-slate-600 text-lg">
                {t('howItWorks.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 z-0" />

              {[
                {
                  step: '01',
                  icon: <Brain className="h-8 w-8" />,
                  color: 'bg-blue-100 text-blue-600',
                  title: t('howItWorks.step1Title'),
                  desc: t('howItWorks.step1Desc'),
                },
                {
                  step: '02',
                  icon: <Sparkles className="h-8 w-8" />,
                  color: 'bg-amber-100 text-amber-600',
                  title: t('howItWorks.step2Title'),
                  desc: t('howItWorks.step2Desc'),
                },
                {
                  step: '03',
                  icon: <MapPin className="h-8 w-8" />,
                  color: 'bg-emerald-100 text-emerald-600',
                  title: t('howItWorks.step3Title'),
                  desc: t('howItWorks.step3Desc'),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow z-10"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <span className="text-5xl font-black text-slate-100 leading-none mt-1">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Featured Heritages Section ===== */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <Badge variant="outline" className="mb-3 text-amber-600 border-amber-200 bg-amber-50">
                  CURATOR&#39;S PICK
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  {t('featured.title')}
                </h2>
                <p className="text-slate-600">{t('featured.description')}</p>
              </div>
              <Button asChild variant="outline" className="hidden sm:flex">
                <Link href="/heritage">
                  {t('featured.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHeritages.map((heritage, i) => (
                <div
                  key={heritage.id}
                  className="fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <HeritageCard heritage={heritage} />
                </div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Button asChild variant="outline">
                <Link href="/heritage">
                  {t('featured.viewAllMobile')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ===== Feature Highlights ===== */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {t('highlights.badge')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                  {t('highlights.titleLine1')}
                  <br />
                  <span className="text-amber-400">{t('highlights.titleHighlight')}</span>
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  {t('highlights.description')}
                </p>

                <div className="space-y-4">
                  {[
                    t('highlights.feature1'),
                    t('highlights.feature2'),
                    t('highlights.feature3'),
                    t('highlights.feature4'),
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0" />
                      <span className="text-slate-300">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-white btn-shine">
                    <Link href="/test">
                      {t('highlights.btnTest')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* MBTI example cards */}
              <div className="space-y-4">
                {[
                  {
                    icon: <Compass className="h-6 w-6" />,
                    color: 'from-blue-600 to-indigo-600',
                    label: 'INTJ',
                    title: t('highlights.card1Title'),
                    desc: t('highlights.card1Desc'),
                    sites: t('highlights.card1Sites').split('|'),
                  },
                  {
                    icon: <Heart className="h-6 w-6" />,
                    color: 'from-emerald-600 to-teal-600',
                    label: 'INFP',
                    title: t('highlights.card2Title'),
                    desc: t('highlights.card2Desc'),
                    sites: t('highlights.card2Sites').split('|'),
                  },
                  {
                    icon: <TreePine className="h-6 w-6" />,
                    color: 'from-orange-500 to-amber-500',
                    label: 'ESFP',
                    title: t('highlights.card3Title'),
                    desc: t('highlights.card3Desc'),
                    sites: t('highlights.card3Sites').split('|'),
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="glass rounded-xl p-5 flex items-start gap-4 hover:bg-white/15 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${card.color} text-white`}>
                          {card.label}
                        </span>
                        <span className="text-white font-semibold">{card.title}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{card.desc}</p>
                      <div className="flex gap-1 flex-wrap">
                        {card.sites.map((s) => (
                          <span key={s} className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Region Stats Section ===== */}
        <section id="recommendations" className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 text-amber-600 border-amber-200 bg-amber-50">
                {t('regions.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('regions.titleLine1')}<br />{t('regions.titleLine2')}
              </h2>
              <p className="text-slate-600 text-lg">
                {t('regions.description')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(regionStats).map(([region, count]) => {
                const isActive = activeRegion === region;
                return (
                  <Link
                    key={region}
                    href={`/heritage?region=${region}`}
                    className={`group p-6 rounded-2xl transition-all duration-300 text-center border hover:shadow-xl
                      ${isActive
                        ? 'bg-slate-900 border-slate-900 shadow-xl ring-2 ring-amber-400 ring-offset-2'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-900 hover:border-slate-900'
                      }
                    `}
                  >
                    <div className="text-3xl mb-2">{REGION_EMOJI[region] || '🏛️'}</div>
                    <div className={`text-3xl font-bold mb-1 ${isActive ? 'text-amber-400' : 'text-amber-500 group-hover:text-amber-400'}`}>
                      {count}
                    </div>
                    <div className={`text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-white'}`}>
                      {t(`regions.${region}`) !== `regions.${region}` ? t(`regions.${region}`) : region}
                    </div>
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-400'}`}>
                      {t('regions.siteSuffix')}
                    </div>
                    {isActive && (
                      <div className="mt-2 text-xs text-amber-400 font-semibold">✓ 선택됨</div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CTA Section ===== */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-10 sm:p-16 text-center text-white overflow-hidden shadow-2xl">
              <div className="absolute inset-0 hero-pattern opacity-20" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <Badge className="mb-6 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {t('cta.badge')}
                </Badge>

                <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
                  {t('cta.titleLine1')}<br />{t('cta.titleLine2')}
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  {t('cta.description')}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-10 py-6 shadow-xl shadow-orange-900/20 btn-shine"
                >
                  <Link href="/test">
                    {t('cta.btnStart')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
