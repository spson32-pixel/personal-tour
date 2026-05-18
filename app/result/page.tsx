'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Loader2,
  Route,
  Share2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RegionFilter from '@/components/heritage/RegionFilter';
import RecommendedCard from '@/components/heritage/RecommendedCard';
import HeritageMap from '@/components/heritage/HeritageMap';
import {
  MBTIType,
  Region,
  GeneratedPersona,
  Heritage,
  RecommendedHeritage,
  MBTIScores,
} from '@/lib/types';
import { getRecommendations, generateCourse, debugRecommendations, compareMBTIRecommendations, MBTI_PROFILES } from '@/lib/recommendation';
import { storage, getMBTIColorTheme } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import heritageEn from '@/lib/i18n/heritage-en.json';
import heritageZh from '@/lib/i18n/heritage-zh.json';
import { getPlacePhoto } from '@/lib/placePhoto';

/** 코스 타임라인 아이템용 이미지 — getPlacePhoto로 실사진 로드 */
function CourseItemImage({ name, city, alt }: { name: string; city: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPlacePhoto(name, city).then(url => {
      if (!cancelled && url) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [name, city]);

  return (
    <>
      {/* 로딩 중 스피너 */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
        </div>
      )}
      {/* 에러 폴백 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-white text-2xl">
          🏛️
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            loaded && !error ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}
    </>
  );
}

type HeritageLocaleEntry = { name: string; city: string; summary: string };
type HeritageEnData = Record<string, HeritageLocaleEntry>;

/** MBTI 차원별 점수바 */
function MBTIDimensionBar({
  leftLabel,
  rightLabel,
  leftScore,
  rightScore,
  leftColor,
  rightColor,
}: {
  leftLabel: string;
  rightLabel: string;
  leftScore: number;
  rightScore: number;
  leftColor: string;
  rightColor: string;
}) {
  const total = leftScore + rightScore || 1;
  const leftPct = Math.round((leftScore / total) * 100);
  const rightPct = 100 - leftPct;
  const dominant = leftScore >= rightScore ? leftLabel : rightLabel;
  const dominantPct = leftScore >= rightScore ? leftPct : rightPct;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-bold ${leftScore >= rightScore ? 'text-slate-900' : 'text-slate-400'}`}>
          {leftLabel}
        </span>
        <span className="text-xs text-slate-500">
          {dominant} {dominantPct}%
        </span>
        <span className={`font-bold ${rightScore > leftScore ? 'text-slate-900' : 'text-slate-400'}`}>
          {rightLabel}
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
        <div
          className={`h-full rounded-l-full transition-all duration-1000 ease-out ${leftColor}`}
          style={{ width: `${leftPct}%` }}
        />
        <div
          className={`h-full rounded-r-full transition-all duration-1000 ease-out ${rightColor}`}
          style={{ width: `${rightPct}%` }}
        />
      </div>
    </div>
  );
}

function ResultContent() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const [mbti, setMbti] = useState<MBTIType>('INFJ');
  const [mbtiScores, setMbtiScores] = useState<MBTIScores | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [recommendations, setRecommendations] = useState<RecommendedHeritage[]>([]);
  const [persona, setPersona] = useState<GeneratedPersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [personaLoading, setPersonaLoading] = useState(true);
  const [course, setCourse] = useState<{
    title: string;
    description: string;
    region: string;
    sites: {
      id: string;
      name: string;
      city: string;
      image: string;
      summary: string;
    }[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const theme = getMBTIColorTheme(mbti);

  useEffect(() => {
    const result = storage.get<{ mbti: MBTIType; scores: MBTIScores; responses: unknown } | null>(
      'mbti_result',
      null
    );
    if (result?.mbti) setMbti(result.mbti);
    if (result?.scores) setMbtiScores(result.scores);
  }, []);

  useEffect(() => {
    const regionParam = searchParams.get('region') as Region | null;
    if (regionParam && regionParam !== 'all') setSelectedRegion(regionParam);
  }, [searchParams]);

  useEffect(() => {
    const recs = getRecommendations(mbti, selectedRegion, 8);
    setRecommendations(recs);
    setLoading(false);
    setCourse(generateCourse(mbti));

    if (process.env.NODE_ENV === 'development') {
      debugRecommendations(mbti, selectedRegion);
    }
  }, [mbti, selectedRegion]);

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        setPersonaLoading(true);
        const topHeritages = getRecommendations(mbti, 'all', 3).map(
          (r) =>
            ({
              id: r.id,
              name: r.name,
              region: r.region,
              city: r.city,
              summary: r.summary,
              tags: r.tags,
              historicalDescription: r.historicalDescription,
              emotionalDescription: r.emotionalDescription,
              popularityScore: r.popularityScore,
              quietScore: r.quietScore,
              imaginationScore: r.imaginationScore,
              historyScore: r.historyScore,
              analysisScore: r.analysisScore,
              emotionalScore: r.emotionalScore,
              structuredCourseScore: r.structuredCourseScore,
              freeExploreScore: r.freeExploreScore,
              natureScore: r.natureScore,
              bestTime: r.bestTime,
              nearbySites: r.nearbySites,
              image: r.image,
              featured: r.featured,
            } as Heritage)
        );

        const response = await fetch('/api/generate-persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mbti, topHeritages, locale }),
        });

        if (response.ok) {
          const data = await response.json();
          setPersona(data);
        }
      } catch (error) {
        console.error('Failed to fetch persona:', error);
      } finally {
        setPersonaLoading(false);
      }
    };

    fetchPersona();
  }, [mbti]);

  const handleRetake = () => {
    storage.remove('mbti_result');
    window.location.href = '/test';
  };

  const handleShare = async () => {
    const personaTitle = persona?.personaTitle || t(`mbti.titles.${mbti}`);
    const text = t('result.shareText', { mbti, title: personaTitle });
    try {
      if (navigator.share) {
        await navigator.share({ title: t('result.shareTitle'), text });
      } else {
        await navigator.clipboard.writeText(text + '\n' + window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // 공유 취소 시 무시
    }
  };

  const MBTI_GROUP: Record<string, string> = {
    NT: t('result.groupNT'),
    NF: t('result.groupNF'),
    SJ: t('result.groupSJ'),
    SP: t('result.groupSP'),
  };
  const groupKey = `${mbti[1]}${mbti[2]}` as keyof typeof MBTI_GROUP;
  const groupName = MBTI_GROUP[groupKey] || '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="py-8 sm:py-12">
        {/* ===== 결과 헤더 (페르소나 카드) ===== */}
        <section className="mb-12">
          <div className={`bg-gradient-to-br ${theme.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 hero-pattern opacity-20" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
              <div className="max-w-3xl mx-auto text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {t('result.personaBadge')}
                  </Badge>
                </div>

                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="text-6xl sm:text-7xl font-black tracking-widest drop-shadow-lg">
                    {mbti}
                  </span>
                  {groupName && (
                    <span className="text-white/60 text-lg font-medium">· {groupName}</span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  {personaLoading ? (
                    <span className="flex items-center justify-center gap-3 text-white/70">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      {t('result.analyzing')}
                    </span>
                  ) : (
                    persona?.personaTitle || t(`mbti.titles.${mbti}`)
                  )}
                </h1>

                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
                  {personaLoading
                    ? t('result.analyzingDesc')
                    : persona?.personaSummary || t(`mbti.descs.${mbti}`)}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={handleShare}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {t('result.shareCopied')}
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t('result.shareBtn')}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRetake}
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('result.retakeBtn')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ===== MBTI 차원 점수 시각화 ===== */}
            {mbtiScores && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg">
                    <Sparkles className={`h-5 w-5 ${theme.primary}`} />
                    {t('result.dimensionTitle')}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <MBTIDimensionBar
                      leftLabel={t('result.dimE')}
                      rightLabel={t('result.dimI')}
                      leftScore={mbtiScores.E}
                      rightScore={mbtiScores.I}
                      leftColor="bg-blue-400"
                      rightColor="bg-indigo-400"
                    />
                    <MBTIDimensionBar
                      leftLabel={t('result.dimN')}
                      rightLabel={t('result.dimS')}
                      leftScore={mbtiScores.N}
                      rightScore={mbtiScores.S}
                      leftColor="bg-purple-400"
                      rightColor="bg-green-400"
                    />
                    <MBTIDimensionBar
                      leftLabel={t('result.dimT')}
                      rightLabel={t('result.dimF')}
                      leftScore={mbtiScores.T}
                      rightScore={mbtiScores.F}
                      leftColor="bg-cyan-400"
                      rightColor="bg-rose-400"
                    />
                    <MBTIDimensionBar
                      leftLabel={t('result.dimJ')}
                      rightLabel={t('result.dimP')}
                      leftScore={mbtiScores.J}
                      rightScore={mbtiScores.P}
                      leftColor="bg-amber-400"
                      rightColor="bg-orange-400"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ===== 탐방 스타일 카드 ===== */}
            {!personaLoading && persona && (
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${theme.gradient}`} />
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                    <MapPin className={`h-5 w-5 ${theme.primary}`} />
                    {t('result.styleTitle')}
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-4">{persona.explorationStyle}</p>
                  {persona.recommendationTone && (
                    <div className={`p-4 rounded-xl ${theme.secondary} border ${theme.accent}`}>
                      <p className={`text-sm italic ${theme.primary}`}>
                        &ldquo;{persona.recommendationTone}&rdquo;
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ===== 추천 코스 + 지도 ===== */}
            {course && (
              <>
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Route className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <Badge className="bg-white/20 text-white border-white/30 mb-1">
                        {t('result.courseBadge')}
                      </Badge>
                      <h3 className="font-bold text-white text-xl">
                        {(locale === 'en' || locale === 'zh') ? t(`mbti.persona.${mbti}.courseTheme`) : course.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-white/80">
                    {(locale === 'en' || locale === 'zh')
                      ? `${t(`mbti.persona.${mbti}.explorationStyle`)} ${t(`mbti.persona.${mbti}.recommendationTone`)}`
                      : course.description}
                  </p>
                </div>

                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4">
                    {course.sites.map((site, i) => {
                      const siteLocaleData = locale === 'zh'
                        ? (heritageZh as HeritageEnData)[site.id]
                        : locale === 'en'
                        ? (heritageEn as HeritageEnData)[site.id]
                        : null;
                      const siteName = siteLocaleData?.name ?? site.name;
                      const siteCity = siteLocaleData?.city ?? site.city;
                      const siteSummary = siteLocaleData?.summary ?? site.summary;
                      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.name + ' ' + site.city)}`;
                      return (
                      <div key={site.id}>
                        <div className="rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
                          <Link href={`/heritage/${site.id}`} className="block">
                            <div className="flex gap-4 p-4 group cursor-pointer">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shadow-md">
                                  {i + 1}
                                </div>
                              </div>
                              <div className="flex-shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-200">
                                <CourseItemImage
                                  name={site.name}
                                  city={site.city}
                                  alt={siteName}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {siteCity}
                                  </Badge>
                                </div>
                                <h4 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">
                                  {siteName}
                                </h4>
                                <p className="text-sm text-slate-600 line-clamp-2">{siteSummary}</p>
                              </div>
                              <div className="flex-shrink-0 self-center">
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                              </div>
                            </div>
                          </Link>
                          {/* 지도 보기 — Link 밖에 배치해 중첩 <a> 방지 */}
                          <div className="px-4 pb-3 flex justify-end">
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t('result.viewOnGoogleMaps')}
                            </a>
                          </div>
                        </div>

                        {i < course.sites.length - 1 && (
                          <div className="flex justify-center py-2">
                            <div className="h-6 w-0.5 bg-gradient-to-b from-amber-300 to-orange-300 rounded-full" />
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-sm text-amber-800">
                      💡 <strong>{t('result.courseTip')}</strong>{' '}
                      {t('result.courseTipText', {
                        region: t(`regions.${course.region}`) !== `regions.${course.region}`
                          ? t(`regions.${course.region}`)
                          : course.region,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* ===== 1일 코스 지도 ===== */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                    <MapPin className={`h-5 w-5 ${theme.primary}`} />
                    {t('result.mapTitle')}
                    <span className="text-sm font-normal text-slate-400">
                      — {t('result.mapSubtitle')}
                    </span>
                  </h3>
                  <HeritageMap sites={course.sites.map(s => ({ name: s.name, city: s.city, image: s.image }))} />
                </CardContent>
              </Card>
              </>
            )}

            {/* ===== 추천 문화유산 ===== */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t('result.recsTitle')}</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {selectedRegion === 'all' ? `${t('result.recsSubAll')} · ` : ''}
                    {t('result.recsSub', { mbti })}
                  </p>
                </div>
                <Button variant="outline" onClick={handleRetake} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('result.retakeLabel')}
                </Button>
              </div>

              <div className="mb-6">
                <RegionFilter selected={selectedRegion} onChange={setSelectedRegion} />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((heritage, index) => (
                    <div
                      key={heritage.id}
                      className="fade-in"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <RecommendedCard heritage={heritage} rank={index + 1} mbti={mbti} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="text-slate-500 mb-4">{t('result.emptyState')}</p>
                  <Button variant="outline" onClick={() => setSelectedRegion('all')}>
                    {t('result.viewAllBtn')}
                  </Button>
                </div>
              )}
            </div>

            {/* ===== 디버깅 패널 (개발 모드에서만) ===== */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded">DEV</span>
                      추천 시스템 디버깅
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
                      {showDebug ? '접기' : '펼치기'}
                    </Button>
                  </div>

                  {showDebug && (
                    <div className="space-y-4 text-sm">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-bold text-slate-900 mb-2">{mbti} 프로필</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-green-600 font-semibold">Primary (×5):</span>
                            <ul className="mt-1 space-y-0.5">
                              {MBTI_PROFILES[mbti].primary.map((p) => (
                                <li key={p} className="text-slate-600">{p}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-blue-600 font-semibold">Secondary (×2):</span>
                            <ul className="mt-1 space-y-0.5">
                              {MBTI_PROFILES[mbti].secondary.map((s) => (
                                <li key={s} className="text-slate-600">{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-red-600 font-semibold">Avoid (×4):</span>
                            <ul className="mt-1 space-y-0.5">
                              {MBTI_PROFILES[mbti].avoid.map((a) => (
                                <li key={a} className="text-slate-600">{a}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-bold text-slate-900 mb-2">현재 추천 결과</h4>
                        <div className="space-y-2">
                          {recommendations.map((rec, idx) => (
                            <div key={rec.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                              <span className="font-bold text-slate-400 w-4">{idx + 1}</span>
                              <span className="flex-1 font-medium">{rec.name}</span>
                              <span className="text-amber-600 font-bold">{rec.matchScore}점</span>
                              <span className="text-xs text-slate-400">{rec.city}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => compareMBTIRecommendations(['INFP', 'ESTJ', 'ISFP', 'ENTJ'], selectedRegion)}>
                          INFP vs ESTJ vs ISFP vs ENTJ
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => compareMBTIRecommendations(['INTJ', 'ENFP', 'ISTJ', 'ESFP'], selectedRegion)}>
                          INTJ vs ENFP vs ISTJ vs ESFP
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ===== 하단 CTA ===== */}
            <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('result.ctaTitle')}</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">{t('result.ctaDesc')}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/">
                    {t('result.ctaHome')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Link href="/test">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('result.ctaRetake')}
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
