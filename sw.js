/* GTA 6 Live Clipper — service worker.
   Pehli baar load hone ke baad captions ki previews (video + poster),
   layout stills aur styles/layout data is phone par SAVE rehte hain —
   dobara kholo to bina download ke foran dikhte hain.
   Gallery ke clip videos (clips/*.mp4) cache NAHI hote — wo bade hain,
   stream se chalte hain. App shell (app.js/index.html) hamesha taza
   version check karta hai, purana cache kabhi chipka nahi rehta. */
var CACHE = "gta6-clipper-v10"; // v9 (2026-11-19): #vod tab fix + Stage layout option + stage-nofacecam — purana v8 cache delete hoga, naya layout.json + stage still taza aayenge
var MEDIA_RE = /\/previews\/|\/positions\/|styles\.json$|layout\.json$|sample_bg\.jpg$|\/clips\/.*-poster\.jpg$/;
var SHELL_RE = /app\.js$|config\.js$|styles\.css$|index\.html$|\/$/;

self.addEventListener("install", function (e) { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) {
    // YouTube thumbnails bhi cache karo — dobara load na hon
    if ((url.hostname === "i.ytimg.com" || url.hostname === "yt3.ggpht.com") && e.request.destination === "image") {
      e.respondWith(
        caches.open(CACHE).then(function (c) {
          return c.match(e.request).then(function (hit) {
            if (hit) return hit;
            return fetch(e.request).then(function (res) {
              if (res && res.ok) c.put(e.request, res.clone());
              return res;
            });
          });
        })
      );
    }
    return;
  }
  var path = url.pathname;
  if (MEDIA_RE.test(path)) {
    // cache-first: ek baar load hua to dobara download nahi
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match(e.request).then(function (hit) {
          if (hit) return hit;
          return fetch(e.request).then(function (res) {
            if (res && res.ok) c.put(e.request, res.clone());
            return res;
          });
        });
      })
    );
  } else if (SHELL_RE.test(path)) {
    // stale-while-revalidate: taza version aate hi use ho, purana kabhi chipke nahi
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match(e.request).then(function (hit) {
          var net = fetch(e.request).then(function (res) {
            if (res && res.ok) c.put(e.request, res.clone());
            return res;
          }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
  }
});
