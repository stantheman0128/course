/* 資工系畢業學分檢核系統 — Service Worker
   策略：stale-while-revalidate — 先回快取（秒開），背景抓新版更新快取，
   下次載入就是新的。離線時純走快取。改大版時 bump CACHE 名稱清掉舊快取。 */
const CACHE = 'course-v2.0.2';

// 安裝時預先快取的核心檔案
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request, { ignoreSearch: true });
      // 背景抓新版（成功就更新快取）
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => null);
      // 有快取就先回快取（背景仍在更新）；沒有就等網路；都失敗則 fallback
      if (cached) return cached;
      const network = await networkFetch;
      if (network) return network;
      if (event.request.mode === 'navigate') {
        return cache.match('./index.html', { ignoreSearch: true });
      }
      return new Response('', { status: 504, statusText: 'Offline' });
    })
  );
});
