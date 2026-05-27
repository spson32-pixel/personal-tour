import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const ref = req.nextUrl.searchParams.get('ref');

  if (!ref || !apiKey) {
    console.error('[/api/places/photo] ref=' + ref + ' apiKey=' + (apiKey ? '있음' : '없음'));
    return NextResponse.json({ error: 'Missing ref or API key' }, { status: 400 });
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
  url.searchParams.set('photo_reference', ref);
  url.searchParams.set('maxwidth', '800');
  url.searchParams.set('key', apiKey);

  try {
    const res = await fetch(url.toString(), { redirect: 'follow' });

    if (!res.ok) {
      return NextResponse.json({ error: 'Photo fetch failed' }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
