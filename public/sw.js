const CACHE_NAME = "artha-pwa-v1";

// Rute & aset penting yang di-cache saat instalasi PWA
const PRECACHE_ASSETS = [
  "/",
  "/expenses",
  "/subscriptions",
  "/budgets",
  "/settings",
  "/icon-192.png",
  "/icon-512.png",
  "/icon.svg",
];

// 1. Install Event: Simpan aset inti ke Cache Storage
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// 2. Activate Event: Bersihkan cache versi lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch Event: Strategi routing & caching
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan tangani request non-GET atau request ke origin luar
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // A. Endpoint API: Network-First dengan Cache Fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // B. Aset Statis (Next.js chunks, fonts, images, icons): Cache-First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // C. Navigasi Halaman HTML: Network-First dengan Fallback ke Cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match("/");
        }),
    );
    return;
  }

  // D. Request lainnya: Network dengan fallback ke Cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  );
});