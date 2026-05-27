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

async function searchPlace(name: string, city: string, apiKey: string): Promise<PlaceResult> {
  const query = `${name} ${city} 한국`;
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'ko');
  url.searchParams.set('region', 'KR');
  url.searchParams.set('key', apiKey);

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();

    console.log(`[/api/places] "${name}" (${city}) → status=${data.status}, results=${data.results?.length ?? 0}`);

    if (data.status !== 'OK' || !data.results?.[0]) {
      return { error: data.status ?? 'NO_RESULTS' };
    }

    const place = data.results[0];
    const lat: number = place.geometry?.location?.lat;
    const lng: number = place.geometry?.location?.lng;

    console.log(`[/api/places] "${name}" 좌표: lat=${lat?.toFixed(5)}, lng=${lng?.toFixed(5)}, 이름="${place.name}"`);

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
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('[/api/places] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 미설정');
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
