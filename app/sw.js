/* 資工系畢業學分檢核系統 — Service Worker
   策略：stale-while-revalidate — 先回快取（秒開），背景抓新版更新快取，
   下次載入就是新的。離線時純走快取。改大版時 bump CACHE 名稱清掉舊快取。 */
const CACHE = 'course-v2.0.3';

/* 安裝時預先快取的核心檔案。
   v2.0.3：拿掉 './index.html' — Cloudflare Pages 把 /index.html 永久
   重導向到 /，cache.addAll() 抓到 redirected response 會整批 reject，
   導致 SW install 失敗、離線不可用。改只快取正規 URL './'。 */
const CORE_ASSETS = [
  './',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // allSettled：單一檔案抓取失敗不會拖垮整個 install
      .then((cache) => Promise.allSettled(
        CORE_ASSETS.map((url) => cache.add(url))
      ))
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
      // 離線且沒快取時，導覽請求 fallback 回正規首頁 './'
      if (event.request.mode === 'navigate') {
        return cache.match('./', { ignoreSearch: true });
      }
      return new Response('', { status: 504, statusText: 'Offline' });
    })
  );
});
