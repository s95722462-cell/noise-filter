// 코골이 노트 — 오프라인 실행용 (새 버전 먼저, 인터넷이 없으면 저장본)
const CACHE = "snore-v9";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
const LAME = "https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js";   // MP3 변환 도구: 한 번 받으면 저장해 두고 씀
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url === LAME) {
    e.respondWith(caches.match(LAME).then(r => r || fetch(e.request).then(x => { if (x.ok || x.type === "opaque") { const c = x.clone(); caches.open(CACHE).then(k => k.put(LAME, c)); } return x; })));
    return;
  }
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
