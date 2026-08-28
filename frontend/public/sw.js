// Caches the site's own static build output (JS, CSS, fonts, local images)
// with a stale-while-revalidate strategy so repeat visits load instantly.
// Anything cross-origin — the API backend, uploaded product images — is left
// untouched so the catalog, prices and bookings are always fetched fresh.

const CACHE_NAME = "hakhverdyan-static-v1";
const CACHEABLE_DESTINATIONS = new Set(["script", "style", "font", "image"]);
const MAX_ENTRIES = 100;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimCache(cache) {
  const keys = await cache.keys();
  const excess = keys.length - MAX_ENTRIES;
  if (excess > 0) {
    for (let i = 0; i < excess; i++) await cache.delete(keys[i]);
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch the API or externally-hosted images
  if (!CACHEABLE_DESTINATIONS.has(req.destination)) return; // never touch navigations/HTML

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            cache.put(req, res.clone());
            trimCache(cache);
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
