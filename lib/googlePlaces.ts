/**
 * Client-side Google Places Service singleton.
 * Import only in useEffect / event handlers (browser-only code).
 *
 * Flow:
 *  1. HeritageMap loads the Maps JS API (libraries: ['places'])
 *  2. HeritageMap calls notifyMapsReady() when the map instance is created
 *  3. searchPlacePhoto() calls queued up while waiting become unblocked
 */

const _photoCache = new Map<string, string | null>();
const _pending   = new Map<string, Promise<string | null>>();
const _queue: Array<() => void> = [];

let _ready   = false;
let _service: google.maps.places.PlacesService | null = null;
let _attrDiv: HTMLDivElement | null = null;

function getService(): google.maps.places.PlacesService {
  if (!_service) {
    _attrDiv = _attrDiv ?? document.createElement('div');
    _service = new google.maps.places.PlacesService(_attrDiv);
  }
  return _service;
}

/** Called by HeritageMap once its map instance is ready. */
export function notifyMapsReady(): void {
  if (_ready) return;
  _ready = true;
  _queue.splice(0).forEach(fn => fn());
}

/**
 * Search Google Places for a heritage site photo URL.
 * Returns null if not found or on timeout (8 s).
 */
export function searchPlacePhoto(name: string, city: string): Promise<string | null> {
  const key = `${name}|${city}`;

  if (_photoCache.has(key)) return Promise.resolve(_photoCache.get(key) ?? null);
  if (_pending.has(key))    return _pending.get(key)!;

  const p = new Promise<string | null>(resolve => {
    // Safety timeout so promises don't hang if Maps API never loads
    const tid = setTimeout(() => {
      const idx = _queue.indexOf(run);
      if (idx !== -1) _queue.splice(idx, 1);
      _photoCache.set(key, null);
      _pending.delete(key);
      resolve(null);
    }, 8000);

    const run = () => {
      clearTimeout(tid);
      try {
        getService().textSearch(
          { query: `${name} ${city} 한국` },
          (results, status) => {
            const url =
              status === google.maps.places.PlacesServiceStatus.OK && results?.[0]?.photos?.[0]
                ? results[0].photos![0].getUrl({ maxWidth: 800 })
                : null;
            _photoCache.set(key, url);
            _pending.delete(key);
            resolve(url);
          }
        );
      } catch {
        _photoCache.set(key, null);
        _pending.delete(key);
        resolve(null);
      }
    };

    if (_ready) run();
    else _queue.push(run);
  });

  _pending.set(key, p);
  return p;
}
