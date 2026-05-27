import { NextRequest, NextResponse } from 'next/server';

interface SiteQuery {
  name: string;
  city: string;
}

interface PlaceResult {
  placeId?: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  error?: string;
}

// Vercel server-to-server 요청에 Referer 헤더 추가 (HTTP referrer 제한 우회)
function getServerReferer(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/`;
  return 'http://localhost:3000/';
}

// 서버 전용 키 → 없으면 공용 키 사용
function getApiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_SERVER_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

async function searchPlace(name: string, city: string, apiKey: string): Promise<PlaceResult> {
  const query = `${name} ${city} 한국`;
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'ko');
  url.searchParams.set('region', 'KR');
  url.searchParams.set('key', apiKey);

  try {
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { 'Referer': getServerReferer() },
    });
    const data = await res.json();

    console.log(`[/api/places] "${name}" (${city}) → status=${data.status}, results=${data.results?.length ?? 0}`);

    if (data.status !== 'OK' || !data.results?.[0]) {
      if (data.status === 'REQUEST_DENIED') {
        console.error(`[/api/places] REQUEST_DENIED — Google API 키 제한 또는 Places API 미활성화. error_message: ${data.error_message}`);
      }
      return { error: data.status ?? 'NO_RESULTS' };
    }

    const place = data.results[0];
    const lat: number = place.geometry?.location?.lat;
    const lng: number = place.geometry?.location?.lng;

    console.log(`[/api/places] "${name}" 좌표: lat=${lat?.toFixed(5)}, lng=${lng?.toFixed(5)}`);

    const result: PlaceResult = { placeId: place.place_id, lat, lng };

    const photoRef: string | undefined = place.photos?.[0]?.photo_reference;
    if (photoRef) {
      result.photoUrl = `/api/places/photo?ref=${encodeURIComponent(photoRef)}`;
    }

    return result;
  } catch (e) {
    console.error(`[/api/places] fetch 실패:`, e);
    return { error: 'fetch failed' };
  }
}

export async function POST(req: NextRequest) {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error('[/api/places] API 키 미설정');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let sites: SiteQuery[];
  try {
    const body = await req.json();
    sites = body.sites;
    if (!Array.isArray(sites)) throw new Error('invalid');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const results = await Promise.all(
    sites.map(({ name, city }) => searchPlace(name, city, apiKey))
  );

  return NextResponse.json({ results });
}
