'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  MapPin,
  Star,
  Clock,
  AlertCircle,
  ChevronLeft,
  MapPinned,
  ArrowRight,
  Users,
  Brain,
  Sparkles,
  ExternalLink,
  Info,
  Heart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heritage, MBTIType } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

// 로컬 JSON 데이터 import
import heritagesData from '@/lib/data/heritages.json';
import heritageEn from '@/lib/i18n/heritage-en.json';
import heritageZh from '@/lib/i18n/heritage-zh.json';
import heritageJa from '@/lib/i18n/heritage-ja.json';
import { getPlacePhoto } from '@/lib/placePhoto';

type HeritageLocaleData = Record<string, {
  name: string;
  city: string;
  summary: string;
  historicalDescription?: string;
  emotionalDescription?: string;
  tags: string[];
  bestTime: string;
  nearbySites: string[];
}>;

function getLocalizedHeritage(heritage: Heritage, locale: string): Heritage {
  if (locale === 'en') {
    const enData = (heritageEn as HeritageLocaleData)[heritage.id];
    if (!enData) return heritage;
    return { ...heritage, ...enData };
  }
  if (locale === 'zh') {
    const zhData = (heritageZh as HeritageLocaleData)[heritage.id];
    if (!zhData) return heritage;
    return { ...heritage, ...zhData };
  }
  if (locale === 'ja') {
    const jaData = (heritageJa as HeritageLocaleData)[heritage.id];
    if (!jaData) return heritage;
    return { ...heritage, ...jaData };
  }
  return heritage;
}

// 점수에 따른 TOP MBTI 계산
function getTopMBTITypes(heritage: Heritage, t: (key: string) => string): { type: MBTIType; score: number; reason: string }[] {
  const mbtiScores: Record<string, number> = {};

  const types: MBTIType[] = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

  types.forEach(type => {
    let score = 0;
    const e = type[0] === 'E' ? heritage.popularityScore : heritage.quietScore;
    const n = type[1] === 'N' ? heritage.imaginationScore : heritage.historyScore;
    const tp = type[2] === 'T' ? heritage.analysisScore : heritage.emotionalScore;
    const j = type[3] === 'J' ? heritage.structuredCourseScore : Math.max(heritage.freeExploreScore, heritage.natureScore);
    score = (e + n + tp + j) / 4;
    mbtiScores[type] = score;
  });

  return Object.entries(mbtiScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, score]) => ({
      type: type as MBTIType,
      score: Math.round(score),
      reason: getMBTIReason(type as MBTIType, heritage, t)
    }));
}

function getMBTIReason(type: MBTIType, heritage: Heritage, t: (key: string) => string): string {
  const reasons: string[] = [];
  if (type[0] === 'E' && heritage.popularityScore > 70) reasons.push(t('mbtiReason.vibrant'));
  if (type[0] === 'I' && heritage.quietScore > 70) reasons.push(t('mbtiReason.serene'));
  if (type[1] === 'N' && heritage.imaginationScore > 70) reasons.push(t('mbtiReason.imaginative'));
  if (type[1] === 'S' && heritage.historyScore > 70) reasons.push(t('mbtiReason.historical'));
  if (type[2] === 'T' && heritage.analysisScore > 70) reasons.push(t('mbtiReason.analytical'));
  if (type[2] === 'F' && heritage.emotionalScore > 70) reasons.push(t('mbtiReason.emotional'));
  if (type[3] === 'J' && heritage.structuredCourseScore > 70) reasons.push(t('mbtiReason.structured'));
  if (type[3] === 'P' && heritage.freeExploreScore > 70) reasons.push(t('mbtiReason.freeExplore'));
  return reasons[0] || t('mbtiReason.balanced');
}

// 추천 동반자 계산
function getRecommendedCompanion(heritage: Heritage, t: (key: string) => string): { type: string; description: string; icon: string } {
  if (heritage.popularityScore > 80) {
    return { type: t('companion.activeGroup'), description: t('companion.activeGroupDesc'), icon: '👥' };
  } else if (heritage.quietScore > 80) {
    return { type: t('companion.quietSolo'), description: t('companion.quietSoloDesc'), icon: '🧘' };
  } else if (heritage.emotionalScore > 80) {
    return { type: t('companion.romanticCouple'), description: t('companion.romanticCoupleDesc'), icon: '💑' };
  } else if (heritage.analysisScore > 80) {
    return { type: t('companion.knowledgeableFriend'), description: t('companion.knowledgeableFriendDesc'), icon: '📚' };
  } else if (heritage.natureScore > 70) {
    return { type: t('companion.natureLover'), description: t('companion.natureLoverDesc'), icon: '🌿' };
  }
  return { type: t('companion.anyone'), description: t('companion.anyoneDesc'), icon: '🤝' };
}

// ─── 주변 맛집 ────────────────────────────────────────────
interface NearbyRestaurant {
  placeId: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  photoUrl: string | null;
  googleMapsUrl: string;
  vicinity: string;
}

function NearbyRestaurantsSection({ name, city }: { name: string; city: string }) {
  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/nearby-restaurants?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setRestaurants(data.restaurants ?? []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [name, city]);

  if (!loading && restaurants.length === 0) return null;

  return (
    <Card className="p-4 bg-white">
      <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
        <span>🍽️</span> {t('heritage.nearbyRestaurants')}
      </h3>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-100">
              <div className="h-24 bg-slate-100 animate-pulse" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {restaurants.map(r => (
            <a
              key={r.placeId}
              href={r.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl overflow-hidden border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all"
            >
              <div className="h-24 bg-slate-100 overflow-hidden relative flex-shrink-0">
                {r.photoUrl ? (
                  <img
                    src={r.photoUrl}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl bg-rose-50">🍜</div>
                )}
              </div>
              <div className="p-2.5 flex-1">
                <p className="font-semibold text-slate-900 text-xs line-clamp-1 mb-1">{r.name}</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-amber-400">⭐</span>
                  <span className="font-bold text-slate-700">{r.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({r.userRatingsTotal.toLocaleString()})</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{r.vicinity}</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-500 font-medium">
                  <ExternalLink className="w-2.5 h-2.5" />
                  {t('heritage.viewOnGoogleMaps')}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── MBTI 차트 바 ─────────────────────────────────────────
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-12">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-8 text-right">{score}</span>
    </div>
  );
}

export default function HeritageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { t, locale } = useTranslation();
  const [heritage, setHeritage] = useState<Heritage | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImgLoaded, setMainImgLoaded] = useState(false);
  const [mainImgError, setMainImgError] = useState(false);
  const [placesPhotoUrl, setPlacesPhotoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mbti' | 'info'>('mbti');

  useEffect(() => {
    const found = (heritagesData as Heritage[]).find((h) => h.id === id);
    setHeritage(found || null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!heritage) return;
    let cancelled = false;
    getPlacePhoto(heritage.name, heritage.city).then(url => {
      if (cancelled || !url) return;
      setPlacesPhotoUrl(url);
      setMainImgError(false);
      setMainImgLoaded(false);
    });
    return () => { cancelled = true; };
  }, [heritage?.name, heritage?.city]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!heritage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">{t('heritage.notFound')}</h1>
          <p className="text-slate-600 mb-8">{t('heritage.notFoundDesc')}</p>
          <Button onClick={() => router.push('/result')} size="lg">{t('heritage.backToResult')}</Button>
        </div>
      </div>
    );
  }

  const localizedHeritage = getLocalizedHeritage(heritage, locale);
  const topMBTIs = getTopMBTITypes(heritage, t);
  const companion = getRecommendedCompanion(heritage, t);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[280px] max-h-[400px] overflow-hidden">
        {!mainImgLoaded && !mainImgError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 z-10">
            <div className="w-10 h-10 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {mainImgError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
            <div className="text-center text-white p-8">
              <div className="text-5xl mb-3">🏛️</div>
              <div className="font-bold text-2xl">{localizedHeritage.name}</div>
              <div className="text-base text-slate-300 mt-1">{localizedHeritage.city}</div>
            </div>
          </div>
        )}

        <img
          src={placesPhotoUrl ?? heritage.image}
          alt={localizedHeritage.name}
          className={`w-full h-full object-cover transition-opacity duration-700 ${mainImgLoaded && !mainImgError ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setMainImgLoaded(true)}
          onError={() => setMainImgError(true)}
        />

        {!mainImgError && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />}

        <button
          onClick={() => router.push('/result')}
          className="absolute top-4 left-4 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-colors border border-white/30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-2 bg-white/20 text-white border-white/40 backdrop-blur-sm text-xs">
              <MapPin className="w-3 h-3 mr-1" />{localizedHeritage.city}
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">{localizedHeritage.name}</h1>
            <p className="text-white/80 text-sm sm:text-base line-clamp-1 max-w-2xl">{localizedHeritage.summary}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-4 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column - Main Info (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quick Info Bar */}
            <Card className="p-4 bg-white">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-600">{localizedHeritage.bestTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinned className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-600">{localizedHeritage.city}</span>
                </div>
                {heritage.featured && (
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    <Star className="w-3 h-3 mr-1" />{t('heritage.recommended')}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Description Tabs */}
            <Card className="bg-white overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t('heritage.tabInfo')}
                </button>
                <button
                  onClick={() => setActiveTab('mbti')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'mbti' ? 'text-violet-600 border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t('heritage.tabMBTI')}
                </button>
              </div>

              <div className="p-5">
                {activeTab === 'info' ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />{t('heritage.historicalTitle')}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{localizedHeritage.historicalDescription}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-amber-500" />{t('heritage.emotionalTitle')}
                      </h3>
                      <p className="text-amber-800 text-sm leading-relaxed">{localizedHeritage.emotionalDescription}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* MBTI Scores - Compact */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-violet-500" />{t('heritage.mbtiAnalysis')}
                      </h3>
                      <div className="space-y-2">
                        <ScoreBar label="E-I" score={heritage.popularityScore} color="bg-rose-500" />
                        <ScoreBar label="N-S" score={heritage.imaginationScore} color="bg-purple-500" />
                        <ScoreBar label="T-F" score={heritage.analysisScore} color="bg-cyan-500" />
                        <ScoreBar label="J-P" score={heritage.structuredCourseScore} color="bg-amber-500" />
                      </div>
                    </div>

                    {/* TOP 3 MBTI - Horizontal */}
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-violet-500" />{t('heritage.mbtiTop3')}
                      </h3>
                      <div className="flex gap-2">
                        {topMBTIs.map((item, idx) => (
                          <div key={item.type} className={`flex-1 p-3 rounded-xl text-center ${idx === 0 ? 'bg-violet-50 border border-violet-200' : 'bg-slate-50'}`}>
                            <div className={`text-xs font-bold mb-1 ${idx === 0 ? 'text-violet-600' : 'text-slate-500'}`}>#{idx + 1}</div>
                            <div className="font-bold text-slate-900 text-sm">{item.type}</div>
                            <div className="text-xs text-slate-500">{item.score}{t('heritage.score')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Tags & Nearby */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4 bg-white">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">{t('heritage.tagsTitle')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {localizedHeritage.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs py-1 px-2 bg-slate-100 hover:bg-slate-200 transition-colors">{tag}</Badge>
                  ))}
                </div>
              </Card>

              {localizedHeritage.nearbySites && localizedHeritage.nearbySites.length > 0 && (
                <Card className="p-4 bg-white">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />{t('heritage.nearbyTitle')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {localizedHeritage.nearbySites.map((site) => (
                      <Badge key={site} variant="outline" className="text-xs py-1 px-2">{site}</Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* 주변 맛집 */}
            <NearbyRestaurantsSection name={heritage.name} city={heritage.city} />
          </div>

          {/* Right Column - Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Companion & Website - Combined */}
            <Card className="p-4 bg-white">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">{t('heritage.infoTitle')}</h3>

              {/* Companion */}
              <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl mb-3">
                <div className="text-2xl">{companion.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-rose-900 text-sm">{companion.type}</p>
                  <p className="text-xs text-rose-700 truncate">{companion.description}</p>
                </div>
              </div>

              {/* Website */}
              {heritage.website && (
                <a
                  href={heritage.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors group"
                >
                  <div className="text-2xl group-hover:scale-110 transition-transform">🌐</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sky-900 text-sm">{t('heritage.officialSite')}</p>
                    <p className="text-xs text-sky-600 flex items-center gap-1">
                      {t('heritage.visitNow')} <ExternalLink className="w-3 h-3" />
                    </p>
                  </div>
                </a>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/quiz')}
                className="w-full h-11 text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md transition-all"
              >
                {t('heritage.retakeTest')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                onClick={() => router.push('/result')}
                variant="outline"
                className="w-full h-10 text-sm"
              >
                {t('heritage.backToResult')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
