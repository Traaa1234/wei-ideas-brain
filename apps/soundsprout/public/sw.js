// Offline support: cache the app shell and the dictionary, serve from cache first,
// refresh in the background. Bump VERSION to drop old caches.
const VERSION = 'soundsprout-v2'
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(['./', './index.html', './dict/cmudict.dict', './dict/extra.dict', './manifest.webmanifest', './icon.svg'])))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(e.request)
      const fresh = fetch(e.request).then((res) => {
        if (res.ok) cache.put(e.request, res.clone())
        return res
      }).catch(() => hit)
      return hit || fresh
    }),
  )
})
