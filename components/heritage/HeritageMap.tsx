'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from '@react-google-maps/api';
import { Loader2, ExternalLink } from 'lucide-react';
import { notifyMapsReady } from '@/lib/googlePlaces';

// ─── 타입 ──────────────────────────────────────────────────
interface InputSite {
  name: string;
  city: string;
  image?: string;
}

interface CourseSite extends InputSite {
  lat: number;
  lng: number;
  photoUrl?: string;
  placeId?: string;
}

interface HeritageMapProps {
  sites: InputSite[];
}

// ─── 상수 ─────────────────────────────────────────────────
const LIBRARIES: ('places')[] = ['places'];
const LABEL_COLORS = ['#F59E0B', '#10B981', '#6366F1'];
const LABELS       = ['A', 'B', 'C'];

// ─── API 키 검증 ───────────────────────────────────────────
const RAW_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

function getKeyStatus(): 'missing' | 'placeholder' | 'ok' {
  if (!RAW_KEY) return 'missing';
  if (
    RAW_KEY.includes('여기에') ||
    RAW_KEY.includes('your_') ||
    RAW_KEY.includes('붙여넣기') ||
    RAW_KEY.length < 20
  ) return 'placeholder';
  return 'ok';
}

const KEY_STATUS = getKeyStatus();
const MASKED_KEY =
  RAW_KEY.length > 10
    ? `${RAW_KEY.slice(0, 6)}...${RAW_KEY.slice(-4)} (길이: ${RAW_KEY.length})`
    : '(비어 있음)';

/** 부모 컴포넌트에서 지도 섹션 조건부 렌더링에 사용 */
export const MAPS_KEY_AVAILABLE = KEY_STATUS === 'ok';

// ─── 도시명 기반 fallback 좌표 ─────────────────────────────
const CITY_FALLBACKS: Array<{ keywords: string[]; lat: number; lng: number }> = [
  { keywords: ['제주', '서귀포'],          lat: 33.4890, lng: 126.4983 },
  { keywords: ['부산'],                    lat: 35.1796, lng: 129.0756 },
  { keywords: ['대구'],                    lat: 35.8714, lng: 128.6014 },
  { keywords: ['인천'],                    lat: 37.4563, lng: 126.7052 },
  { keywords: ['광주'],                    lat: 35.1595, lng: 126.8526 },
  { keywords: ['대전'],                    lat: 36.3504, lng: 127.3845 },
  { keywords: ['울산'],                    lat: 35.5384, lng: 129.3114 },
  { keywords: ['경주'],                    lat: 35.8562, lng: 129.2246 },
  { keywords: ['전주'],                    lat: 35.8242, lng: 127.1480 },
  { keywords: ['안동'],                    lat: 36.5684, lng: 128.7294 },
  { keywords: ['강릉'],                    lat: 37.7519, lng: 128.8760 },
  { keywords: ['속초'],                    lat: 38.2070, lng: 128.5918 },
  { keywords: ['공주'],                    lat: 36.4465, lng: 127.1190 },
  { keywords: ['부여'],                    lat: 36.2748, lng: 126.9099 },
  { keywords: ['여수'],                    lat: 34.7604, lng: 127.6622 },
  { keywords: ['순천'],                    lat: 34.9506, lng: 127.4872 },
  { keywords: ['수원'],                    lat: 37.2636, lng: 127.0286 },
  { keywords: ['청주'],                    lat: 36.6424, lng: 127.4890 },
  { keywords: ['천안'],                    lat: 36.8151, lng: 127.1139 },
  { keywords: ['서울', '종로', '강남', '강북', '마포', '용산', '광진'], lat: 37.5665, lng: 126.9780 },
];

function getCityFallback(city: string, index: number): { lat: number; lng: number } {
  for (const entry of CITY_FALLBACKS) {
    if (entry.keywords.some(kw => city.includes(kw))) {
      return { lat: entry.lat + index * 0.003, lng: entry.lng + index * 0.003 };
    }
  }
  return { lat: 36.5 + index * 0.05, lng: 127.8 + index * 0.05 };
}

// ─── 컴포넌트 ──────────────────────────────────────────────
export default function HeritageMap({ sites }: HeritageMapProps) {
  const [courseSites,        setCourseSites]        = useState<CourseSite[]>([]);
  const [activeIdx,   setActiveIdx]   = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  // 개발 환경 키 진단
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (KEY_STATUS === 'missing') {
      console.error('[HeritageMap] ❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 없음 — .env.local 확인 후 서버 재시작');
    } else if (KEY_STATUS === 'placeholder') {
      console.warn(`[HeritageMap] ⚠️ 플레이스홀더 값: "${RAW_KEY}"`);
    } else {
      console.log(`[HeritageMap] ✅ API 키 확인: ${MASKED_KEY}`);
    }
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'heritage-google-map',
    googleMapsApiKey: RAW_KEY,
    libraries: LIBRARIES,
    language: 'ko',
  });

  /**
   * onMapLoad — 기존 핵심 로직 (수정 금지)
   *
   *  좌표 획득 우선순위:
   *  1순위: 서버사이드 /api/places (REST Places Text Search — viewport 편향 없음)
   *  2순위: 도시명 기반 fallback (제주→제주 좌표, 서울→서울 좌표)
   */
  const onMapLoad = useCallback(
    async (map: google.maps.Map) => {
      mapRef.current = map;
      notifyMapsReady();

      if (!sites.length) return;
      setIsSearching(true);

      // ── 1순위: 서버사이드 Places Text Search ──────────────
      let serverResults: Array<{
        placeId?: string;
        lat?: number;
        lng?: number;
        photoUrl?: string;
        error?: string;
      } | null> = sites.map(() => null);

      try {
        const res = await fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sites: sites.map(s => ({ name: s.name, city: s.city })),
          }),
        });
        const data = await res.json();
        if (Array.isArray(data.results)) {
          serverResults = data.results;
        }
      } catch (e) {
        console.warn('[HeritageMap] 서버 API 호출 실패:', e);
      }

      // ── 모든 장소 최종 좌표 결정 ──────────────────────────
      const resolved = serverResults.map((srv, i) => {
        const site = sites[i];

        if (srv && !srv.error && typeof srv.lat === 'number' && typeof srv.lng === 'number') {
          console.log(
            `%c[HeritageMap] ${site.name}`,
            'font-weight:bold;color:#10B981',
            `\n  출처: 서버 REST API  ✅`,
            `\n  좌표: lat=${srv.lat.toFixed(5)}, lng=${srv.lng.toFixed(5)}`,
            `\n  placeId: ${srv.placeId ?? '없음'}`,
            `\n  사진: ${srv.photoUrl ? '있음' : '없음'}`,
          );
          return { ...site, lat: srv.lat, lng: srv.lng, photoUrl: srv.photoUrl, placeId: srv.placeId } as CourseSite;
        }

        const fb = getCityFallback(site.city, i);
        console.warn(
          `%c[HeritageMap] ${site.name}`,
          'font-weight:bold;color:#EF4444',
          `\n  출처: 도시명 fallback  (서버 오류: ${srv?.error ?? '없음'})`,
          `\n  좌표: lat=${fb.lat.toFixed(5)}, lng=${fb.lng.toFixed(5)}`,
          `\n  도시 키워드: "${site.city}"`,
        );
        return { ...site, lat: fb.lat, lng: fb.lng } as CourseSite;
      });

      setCourseSites(resolved);
      setIsSearching(false);

      // ── 지도 중심 및 범위 조정 ─────────────────────────────
      map.setCenter({ lat: resolved[0].lat, lng: resolved[0].lng });
      map.setZoom(11);

      if (resolved.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        resolved.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
        map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
      }
    },
    [sites]
  );

  // ─── 에러 / 로딩 상태 ──────────────────────────────────────

  if (KEY_STATUS !== 'ok') {
    console.error('[HeritageMap] API 키 없음 또는 플레이스홀더. status=' + KEY_STATUS + ' key=' + MASKED_KEY);
    return null;
  }

  if (loadError) {
    console.error('[HeritageMap] Google Maps 로드 실패 (Maps JavaScript API 활성화 필요):', loadError.message);
    // 인터랙티브 지도 대신 Google Maps 링크 목록으로 폴백
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        {sites.map((site, i) => (
          <a
            key={i}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.name + ' ' + site.city)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: LABEL_COLORS[i] ?? '#888' }}
            >
              {LABELS[i] ?? i + 1}
            </span>
            <span className="text-sm font-medium text-slate-700 flex-1">{site.name}</span>
            <span className="text-xs text-slate-400">{site.city}</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          </a>
        ))}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{ height: 500 }}
        className="flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200"
      >
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Google Maps 스크립트 로딩 중...</p>
        </div>
      </div>
    );
  }

  // ─── 지도 렌더링 ───────────────────────────────────────────
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">

      {/* 범례 */}
      {courseSites.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 flex-wrap">
          {courseSites.map((site, i) => (
            <button
              key={i}
              type="button"
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              onClick={() => setActiveIdx(i === activeIdx ? null : i)}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                style={{ backgroundColor: LABEL_COLORS[i] ?? '#888' }}
              >
                {LABELS[i] ?? i + 1}
              </span>
              <span className="text-xs text-slate-700 font-medium">{site.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 지도 컨테이너 */}
      <div style={{ position: 'relative', width: '100%', height: 500 }}>

        {isSearching && (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.7)',
            }}
          >
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <p className="text-sm">관광지 좌표 검색 중...</p>
            </div>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: 36.5, lng: 127.8 }}
          zoom={7}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
          onLoad={onMapLoad}
        >
          {/* ── 기존: A → B → C 동선 (수정 금지) ── */}
          {courseSites.length > 1 && (
            <Polyline
              path={courseSites.map(s => ({ lat: s.lat, lng: s.lng }))}
              options={{
                strokeColor: '#F59E0B',
                strokeOpacity: 0.9,
                strokeWeight: 3,
                icons: [
                  {
                    icon: {
                      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      scale: 3,
                      fillColor: '#F59E0B',
                      fillOpacity: 1,
                      strokeColor: '#F59E0B',
                    },
                    offset: '50%',
                  },
                ],
              }}
            />
          )}

          {/* ── 기존: 여행지 번호 마커 (수정 금지) ── */}
          {courseSites.map((site, i) => (
            <Marker
              key={`site-${i}`}
              position={{ lat: site.lat, lng: site.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: LABEL_COLORS[i] ?? '#888',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2.5,
              }}
              label={{
                text: LABELS[i] ?? String(i + 1),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
              title={site.name}
              onClick={() => setActiveIdx(i === activeIdx ? null : i)}
            />
          ))}

          {/* ── 기존: 여행지 클릭 팝업 (수정 금지) ── */}
          {activeIdx !== null && courseSites[activeIdx] && (
            <InfoWindow
              position={{ lat: courseSites[activeIdx].lat, lng: courseSites[activeIdx].lng }}
              onCloseClick={() => setActiveIdx(null)}
              options={{ pixelOffset: new google.maps.Size(0, -34) }}
            >
              <div style={{ maxWidth: 220, fontFamily: 'sans-serif' }}>
                {courseSites[activeIdx].photoUrl ? (
                  <img
                    src={courseSites[activeIdx].photoUrl}
                    alt={courseSites[activeIdx].name}
                    style={{
                      width: '100%', height: 130, objectFit: 'cover',
                      borderRadius: 8, marginBottom: 8, display: 'block',
                    }}
                    onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
                  />
                ) : (
                  <div
                    style={{
                      height: 80, background: '#f1f5f9', borderRadius: 8,
                      marginBottom: 8, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 28,
                    }}
                  >
                    🏛️
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span
                    style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: LABEL_COLORS[activeIdx] ?? '#888',
                      color: 'white', fontWeight: 'bold', fontSize: 11,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {LABELS[activeIdx]}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                    {courseSites[activeIdx].name}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', paddingLeft: 26 }}>
                  {courseSites[activeIdx].city}
                </div>
              </div>
            </InfoWindow>
          )}

        </GoogleMap>
      </div>
    </div>
  );
}
