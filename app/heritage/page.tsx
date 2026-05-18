'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeritageCard from '@/components/heritage/HeritageCard';
import RegionFilter from '@/components/heritage/RegionFilter';
import { getAllHeritages } from '@/lib/recommendation';
import { Region, REGION_MAP } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

function HeritageList() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const allHeritages = useMemo(() => getAllHeritages(), []);

  const initialRegion = useMemo<Region>(() => {
    const param = searchParams.get('region');
    if (param && param in REGION_MAP) return param as Region;
    return 'all';
  }, [searchParams]);

  const [selectedRegion, setSelectedRegion] = useState<Region>(initialRegion);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelectedRegion(initialRegion);
  }, [initialRegion]);

  const filtered = useMemo(() => {
    return allHeritages.filter((h) => {
      const matchesRegion = selectedRegion === 'all' || h.region === selectedRegion;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesRegion && matchesSearch;
    });
  }, [allHeritages, selectedRegion, searchQuery]);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <Badge variant="outline" className="mb-3 text-amber-600 border-amber-200 bg-amber-50">
          ALL DESTINATIONS
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          {t('featured.title')}
        </h1>
        <p className="text-slate-600">{t('featured.description')}</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('heritage.searchPlaceholder') || '여행지 이름, 도시, 태그 검색...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Region filter */}
      <div className="mb-8">
        <RegionFilter selected={selectedRegion} onChange={setSelectedRegion} />
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500 mb-6">
        {filtered.length}개의 여행지
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((heritage) => (
            <HeritageCard key={heritage.id} heritage={heritage} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">🏛️</div>
          <p className="text-lg font-medium">검색 결과가 없습니다.</p>
          <p className="text-sm mt-1">다른 키워드나 지역을 선택해 보세요.</p>
        </div>
      )}
    </main>
  );
}

export default function HeritagePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<div className="py-20 text-center text-slate-400">로딩 중...</div>}>
        <HeritageList />
      </Suspense>
      <Footer />
    </div>
  );
}
