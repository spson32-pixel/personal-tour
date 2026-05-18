'use client';

import Link from 'next/link';
import { MapPin, Star, Clock } from 'lucide-react';
import { Heritage } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
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

interface HeritageCardProps {
  heritage: Heritage;
  matchScore?: number;
  showMatchScore?: boolean;
}

function getTagStyle(tag: string): string {
  const lower = tag.toLowerCase();
  if (lower.includes('unesco') || lower.includes('world heritage') || tag.includes('世界遗产')) return 'bg-amber-100 text-amber-700';
  if (lower.includes('palace') || lower.includes('궁궐') || tag.includes('宫殿')) return 'bg-blue-100 text-blue-700';
  if (lower.includes('temple') || lower.includes('사찰') || lower.includes('산사') || tag.includes('寺庙') || tag.includes('寺院')) return 'bg-orange-100 text-orange-700';
  if (lower.includes('fortress') || lower.includes('산성') || tag.includes('山城') || tag.includes('城墙')) return 'bg-green-100 text-green-700';
  if (lower.includes('nature') || lower.includes('자연') || tag.includes('自然')) return 'bg-emerald-100 text-emerald-700';
  if (lower.includes('history') || lower.includes('역사') || tag.includes('历史')) return 'bg-red-100 text-red-700';
  if (lower.includes('folk') || lower.includes('민속') || tag.includes('民俗')) return 'bg-purple-100 text-purple-700';
  if (lower.includes('garden') || lower.includes('정원') || tag.includes('庭园') || tag.includes('花园')) return 'bg-teal-100 text-teal-700';
  if (lower.includes('대표') || tag.includes('地标')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-slate-100 text-slate-600';
}

export default function HeritageCard({
  heritage,
  matchScore,
  showMatchScore = false,
}: HeritageCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [placesPhotoUrl, setPlacesPhotoUrl] = useState<string | null>(null);
  const { locale, t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  // 카드가 뷰포트에 진입할 때만 Places API 호출 (200개 동시 호출 방지)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05, rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    getPlacePhoto(heritage.name, heritage.city).then(url => {
      if (cancelled || !url) return;
      setPlacesPhotoUrl(url);
      setImgError(false);
      setImgLoaded(false);
    });
    return () => { cancelled = true; };
  }, [isVisible, heritage.name, heritage.city]);

  const imageSrc = placesPhotoUrl ?? heritage.image;

  return (
    <Link href={`/heritage/${heritage.id}`} className="block group h-full">
      <div ref={cardRef} className="card-hover bg-white rounded-2xl overflow-hidden border border-slate-100 h-full flex flex-col shadow-sm">
        {/* Image area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-800 flex-shrink-0">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
            </div>
          )}

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
            src={imageSrc}
            alt={displayName}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imgLoaded && !imgError ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              // Places 사진도 실패하면 에러 상태로
              if (placesPhotoUrl) {
                setPlacesPhotoUrl(null);
              }
              setImgError(true);
            }}
            loading="lazy"
          />

          {!imgError && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          )}

          {heritage.featured && !imgError && (
            <div className="absolute top-3 left-3">
              <span className="bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                ✦ {t('heritage.recommended')}
              </span>
            </div>
          )}

          {showMatchScore && matchScore !== undefined && !imgError && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full text-sm font-bold text-slate-900 shadow">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              {matchScore}%
            </div>
          )}

          <div className={`absolute bottom-3 left-3 ${imgError ? 'z-10' : ''}`}>
            <Badge className={`border-0 text-xs shadow-sm ${imgError ? 'bg-white text-slate-800' : 'bg-white/90 text-slate-800 hover:bg-white'}`}>
              <MapPin className="h-3 w-3 mr-1 text-slate-500" />
              {displayCity}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
            {displayName}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
            {displaySummary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Best time */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{displayBestTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
