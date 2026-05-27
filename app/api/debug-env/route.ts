import { NextResponse } from 'next/server';

function getServerReferer(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/`;
  return 'http://localhost:3000/';
}

export async function GET() {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const referer = getServerReferer();

  const result: Record<string, unknown> = {
    hasKey: !!key,
    keyLength: key?.length ?? 0,
    keyPrefix: key ? key.slice(0, 8) + '...' : null,
    vercelUrl: process.env.VERCEL_URL ?? null,
    refererUsed: referer,
    nodeEnv: process.env.NODE_ENV,
  };

  if (!key) return NextResponse.json(result);

  // Referer 없이 호출 (기존 방식)
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', '경복궁 서울 한국');
    url.searchParams.set('language', 'ko');
    url.searchParams.set('key', key);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();
    result.placesApi_noReferer = {
      status: data.status,
      error_message: data.error_message ?? null,
    };
  } catch (e) {
    result.placesApi_noReferer = { error: String(e) };
  }

  // Referer 헤더 포함 호출 (수정된 방식)
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', '경복궁 서울 한국');
    url.searchParams.set('language', 'ko');
    url.searchParams.set('key', key);

    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { 'Referer': referer },
    });
    const data = await res.json();
    result.placesApi_withReferer = {
      status: data.status,
      error_message: data.error_message ?? null,
      results_count: data.results?.length ?? 0,
    };
  } catch (e) {
    result.placesApi_withReferer = { error: String(e) };
  }

  return NextResponse.json(result, { status: 200 });
}
