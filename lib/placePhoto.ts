/**
 * 서버사이드 /api/places 를 통해 Google Places 사진을 가져오는 공용 유틸리티.
 *
 * - Maps JavaScript API 로드 여부와 무관하게 모든 페이지에서 사용 가능
 * - 모듈 레벨 캐시로 동일 장소 중복 요청 방지
 * - in-flight 중복 방지 (pending Map)
 */

const _cache = new Map<string, string | null>();
const _pending = new Map<string, Promise<string | null>>();

export function getPlacePhoto(name: string, city: string): Promise<string | null> {
  const key = `${name}|${city}`;

  if (_cache.has(key)) return Promise.resolve(_cache.get(key) ?? null);
  if (_pending.has(key)) return _pending.get(key)!;

  const p = fetch('/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sites: [{ name, city }] }),
  })
    .then(r => r.json())
    .then((data): string | null => {
      const url: string | null = data.results?.[0]?.photoUrl ?? null;
      _cache.set(key, url);
      _pending.delete(key);
      return url;
    })
    .catch((): null => {
      _cache.set(key, null);
      _pending.delete(key);
      return null;
    });

  _pending.set(key, p);
  return p;
}
