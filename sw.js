const V = "halaqa-v5";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const same = new URL(r.url).origin === location.origin;
  if (same) {
    // ملفات التطبيق: من الشبكة دائماً وبدون كاش المتصفح، وإلا فمن النسخة المخزنة عند انقطاع الإنترنت
    e.respondWith(
      fetch(r, { cache: "no-store" })
        .then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
        .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("./index.html")))
    );
  } else {
    // الخطوط والمكتبات الخارجية: من المخزن أولاً
    e.respondWith(
      caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }))
    );
  }
});
