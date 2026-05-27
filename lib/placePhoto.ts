const _cache = new Map<string, string>();
const _pending = new Map<string, Promise<string | null>>();

export function getPlacePhoto(name: string, city: string): Promise<string | null> {
  const key = `${name}|${city}`;

  if (_cache.has(key)) return Promise.resolve(_cache.get(key)!);
  if (_pending.has(key)) return _pending.get(key)!;

  const p = fetch('/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sites: [{ name, city }] }),
  })
    .then(r => r.json())
    .then((data): string | null => {
      const url: string | null = data.results?.[0]?.photoUrl ?? null;
      if (url) _cache.set(key, url); // 성공한 URL만 캐싱 — 실패는 캐싱하지 않아 재시도 가능
      _pending.delete(key);
      return url;
    })
    .catch((): null => {
      _pending.delete(key);
      return null;
    });

  _pending.set(key, p);
  return p;
}
