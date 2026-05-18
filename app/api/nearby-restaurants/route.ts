import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface NearbyRestaurant {
  placeId: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  photoUrl: string | null;
  googleMapsUrl: string;
  vicinity: string;
}

interface RawPlace {
  place_id?: string;
  name?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  vicinity?: string;
}

// ─── 좌표 취득 ────────────────────────────────────────────
async function getCoords(name: string, city: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', `${name} ${city} 한국`);
  url.searchParams.set('language', 'ko');
  url.searchParams.set('region', 'KR');
  url.searchParams.set('key', API_KEY!);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const data = await res.json();

  console.log(`[nearby-restaurants] coords "${name}" → ${data.status}`);
  if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) return null;
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

// ─── 단일 nearbySearch 호출 ────────────────────────────────
async function nearbySearch(
  lat: number,
  lng: number,
  radius: number,
  keyword?: string,
): Promise<RawPlace[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('type', 'restaurant');
  url.searchParams.set('language', 'ko');
  if (keyword) url.searchParams.set('keyword', keyword);
  url.searchParams.set('key', API_KEY!);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const data = await res.json();
  console.log(`[nearby-restaurants] nearbySearch radius=${radius}${keyword ? ` keyword=${keyword}` : ''} → ${data.status} (${data.results?.length ?? 0}건)`);
  return (data.results as RawPlace[]) ?? [];
}

// ─── placeId 기준 중복 제거 ────────────────────────────────
function mergeUnique(...arrays: RawPlace[][]): RawPlace[] {
  const seen = new Set<string>();
  return arrays.flat().filter(r => {
    if (!r.place_id || seen.has(r.place_id)) return false;
    seen.add(r.place_id);
    return true;
  });
}

// ─── RawPlace → NearbyRestaurant 변환 ─────────────────────
function toRestaurant(r: RawPlace): NearbyRestaurant {
  const photoRef = r.photos?.[0]?.photo_reference;
  return {
    placeId: r.place_id!,
    name: r.name ?? '식당',
    rating: r.rating ?? 0,
    userRatingsTotal: r.user_ratings_total ?? 0,
    photoUrl: photoRef ? `/api/places/photo?ref=${encodeURIComponent(photoRef)}` : null,
    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
    vicinity: r.vicinity ?? '',
  };
}

// ─── 후보 pool → 상위 3개 선택 ────────────────────────────
// minRating 이상인 것을 우선, 없으면 평점·리뷰 순으로 최선 반환
function pickTop(pool: RawPlace[], minRating: number, limit = 3): NearbyRestaurant[] {
  const qualified = pool.filter(r => (r.rating ?? 0) >= minRating);
  const source = qualified.length > 0 ? qualified : pool;
  return source
    .filter(r => r.place_id)
    .sort((a, b) => {
      const rd = (b.rating ?? 0) - (a.rating ?? 0);
      if (Math.abs(rd) >= 0.1) return rd;
      return (b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0);
    })
    .slice(0, limit)
    .map(toRestaurant);
}

// ─── 메인: 3단계 폴백 ────────────────────────────────────
async function fetchNearbyRestaurants(lat: number, lng: number): Promise<NearbyRestaurant[]> {
  // 1단계: 2km, restaurant 타입, 평점 4.0+
  const base2km = await nearbySearch(lat, lng, 2000);
  const top_4 = base2km.filter(r => (r.rating ?? 0) >= 4.0);
  if (top_4.length >= 3) return pickTop(base2km, 4.0);

  // 2단계: 2km, 키워드 병행 검색(맛집·식당·카페) → 합산 후 4.0+ 재시도
  const [kwFood, kwRestaurant, kwCafe] = await Promise.all([
    nearbySearch(lat, lng, 2000, '맛집'),
    nearbySearch(lat, lng, 2000, '식당'),
    nearbySearch(lat, lng, 2000, '카페'),
  ]);
  const merged2km = mergeUnique(base2km, kwFood, kwRestaurant, kwCafe);
  const top_4_merged = merged2km.filter(r => (r.rating ?? 0) >= 4.0);
  if (top_4_merged.length >= 1) return pickTop(merged2km, 4.0);

  // 3단계: 5km 확장, 평점 3.5 이상 / 없으면 리뷰 많은 순
  const base5km = await nearbySearch(lat, lng, 5000);
  const merged5km = mergeUnique(merged2km, base5km);
  return pickTop(merged5km, 3.5);
}

// ─── Route Handler ────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY not set' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') ?? '';
  const city = searchParams.get('city') ?? '';

  if (!name || !city) {
    return NextResponse.json({ error: 'name and city are required' }, { status: 400 });
  }

  try {
    const coords = await getCoords(name, city);
    if (!coords) return NextResponse.json({ restaurants: [] });

    const restaurants = await fetchNearbyRestaurants(coords.lat, coords.lng);
    return NextResponse.json({ restaurants });
  } catch (e) {
    console.error('[/api/nearby-restaurants] error:', e);
    return NextResponse.json({ restaurants: [] });
  }
}
