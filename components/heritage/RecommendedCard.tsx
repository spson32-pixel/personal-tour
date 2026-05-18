'use client';

import Link from 'next/link';
import { MapPin, Star, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { RecommendedHeritage, MBTIType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { getScoreColorClass } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import heritageEn from '@/lib/i18n/heritage-en.json';
import heritageZh from '@/lib/i18n/heritage-zh.json';
import { getPlacePhoto } from '@/lib/placePhoto';

type HeritageLocaleData = Record<string, {
  name: string;
  city: string;
  summary: string;
  tags: string[];
  bestTime: string;
}>;

function getTagColor(tag: string): string {
  const lower = tag.toLowerCase();
  if (lower.includes('unesco') || lower.includes('world heritage') || tag.includes('世界遗产')) return 'bg-amber-100 text-amber-700';
  if (lower.includes('palace') || lower.includes('궁궐') || tag.includes('宫殿')) return 'bg-blue-100 text-blue-700';
  if (lower.includes('temple') || lower.includes('사찰') || lower.includes('산사') || tag.includes('寺庙') || tag.includes('寺院')) return 'bg-orange-100 text-orange-700';
  if (lower.includes('fortress') || lower.includes('산성') || tag.includes('山城') || tag.includes('城墙')) return 'bg-green-100 text-green-700';
  if (lower.includes('nature') || lower.includes('자연') || tag.includes('自然')) return 'bg-emerald-100 text-emerald-700';
  if (lower.includes('history') || lower.includes('역사') || tag.includes('历史')) return 'bg-red-100 text-red-700';
  if (lower.includes('folk') || lower.includes('민속') || tag.includes('民俗')) return 'bg-purple-100 text-purple-700';
  if (lower.includes('memorial') || lower.includes('추모') || tag.includes('纪念')) return 'bg-slate-100 text-slate-700';
  if (lower.includes('대표') || lower.includes('landmark') || lower.includes('featured') || tag.includes('地标')) return 'bg-yellow-100 text-yellow-700';
  if (lower.includes('garden') || lower.includes('정원') || tag.includes('庭园') || tag.includes('花园')) return 'bg-teal-100 text-teal-700';
  return 'bg-slate-100 text-slate-600';
}

interface RecommendedCardProps {
  heritage: RecommendedHeritage;
  rank: number;
  mbti?: MBTIType;
}

const ATTR_TO_REASON_KEY: Record<string, string> = {
  emotionalScore: 'emotional',
  natureScore: 'nature',
  historyScore: 'historical',
  structuredCourseScore: 'structured',
  freeExploreScore: 'freeExplore',
  popularityScore: 'vibrant',
  quietScore: 'serene',
  imaginationScore: 'imaginative',
  analysisScore: 'analytical',
};

export default function RecommendedCard({ heritage, rank, mbti }: RecommendedCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [placesPhotoUrl, setPlacesPhotoUrl] = useState<string | null>(null);
  const { locale, t } = useTranslation();
  const scoreColor = getScoreColorClass(heritage.matchScore);

  // 서버사이드 /api/places 를 통해 실제 Google 사진 로드
  useEffect(() => {
    let cancelled = false;
    getPlacePhoto(heritage.name, heritage.city).then(url => {
      if (cancelled || !url) return;
      setPlacesPhotoUrl(url);
      setImgError(false);
      setImgLoaded(false);
    });
    return () => { cancelled = true; };
  }, [heritage.name, heritage.city]);

  const localeData = locale === 'zh'
    ? (heritageZh as HeritageLocaleData)[heritage.id]
    : locale === 'en'
    ? (heritageEn as HeritageLocaleData)[heritage.id]
    : null;
  const displayName = localeData?.name ?? heritage.name;
  const displayCity = localeData?.city ?? heritage.city;
  const displaySummary = localeData?.summary ?? heritage.summary;
  const displayTags = localeData?.tags ?? heritage.tags;
  const displayBestTime = localeData?.bestTime ?? heritage.bestTime;

  const isTopMatch = heritage.matchScore >= 85;

  return (
    <Link href={`/heritage/${heritage.id}`} className="block group">
      <div className={`
        card-hover-subtle bg-white rounded-2xl overflow-hidden cursor-pointer
        border transition-all duration-300
        ${isTopMatch
          ? 'border-amber-200 shadow-md shadow-amber-50'
          : 'border-slate-100 shadow-sm'
        }
      `}>
        <div className="flex flex-col sm:flex-row">
          {/* 이미지 영역 */}
          <div className="relative w-full sm:w-52 lg:w-64 h-52 sm:h-auto min-h-[200px] flex-shrink-0 overflow-hidden bg-slate-800">
            {/* 로딩 상태 */}
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              </div>
            )}
            
            {/* 에러 상태 - 유산 이름 표시 */}
            {imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="text-center text-white p-4">
                  <div className="text-4xl mb-2">🏛️</div>
                  <div className="font-bold text-lg">{displayName}</div>
                  <div className="text-sm text-slate-300 mt-1">{displayCity}</div>
                </div>
              </div>
            )}
            
            <img
              src={placesPhotoUrl ?? heritage.image}
              alt={heritage.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imgLoaded && !imgError ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              loading="lazy"
            />

            {/* 오버레이 (이미지 로드 성공 시에만) */}
            {!imgError && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-black/20" />
            )}

            {/* 순위 뱃지 */}
            <div className={`
              absolute top-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-lg
              ${rank === 1
                ? 'bg-amber-400 text-white'
                : rank <= 3
                ? 'bg-slate-800 text-white'
                : 'bg-white/90 text-slate-700'
              }
            `}>
              {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
            </div>

            {/* 매칭 점수 */}
            <div className={`absolute bottom-3 left-3 sm:bottom-auto sm:top-3 sm:right-3 sm:left-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold shadow-sm ${scoreColor}`}>
              <Star className="h-3.5 w-3.5 fill-current" />
              {heritage.matchScore}%
            </div>

            {/* TOP MATCH 뱃지 */}
            {isTopMatch && !imgError && (
              <div className="absolute top-3 right-3 sm:hidden">
                <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  TOP
                </span>
              </div>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 h-full">
              <div className="flex-1 flex flex-col h-full">
                {/* 지역 + TOP 뱃지 */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs py-0.5">
                    <MapPin className="h-3 w-3 mr-1" />
                    {displayCity}
                  </Badge>
                  {isTopMatch && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      TOP MATCH
                    </span>
                  )}
                </div>

                {/* 유산명 */}
                <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight">
                  {displayName}
                </h3>

                {/* 요약 */}
                <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  {displaySummary}
                </p>

                {/* 매칭 이유 */}
                {heritage.matchReasons.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {heritage.matchReasons.slice(0, 2).map((reason, idx) => {
                      const reasonKey = ATTR_TO_REASON_KEY[reason];
                      const label = reasonKey ? t(`mbtiReason.${reasonKey}`) : reason;
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600 leading-relaxed">{label}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 하단: 태그 + 방문 시간 */}
                <div className="mt-auto space-y-2">
                  {/* 태그 */}
                  <div className="flex flex-wrap gap-1.5">
                    {displayTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 추천 방문 시간 */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span className="line-clamp-1">{displayBestTime}</span>
                  </div>
                </div>
              </div>

              {/* 화살표 */}
              <div className="flex-shrink-0 self-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
