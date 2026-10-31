// Offline support: serve the app from cache, refresh it in the background when online.
const CACHE="deen-diary-v30";
const FILES=["./","index.html","css/app.css","js/app.js","i18n/en.js","i18n/roman.js","i18n/ur.js","js/config.js","js/cloud.js","js/quran-data.js","js/learn.js","js/journal.js","js/azkar-data.js","js/prayer.js","js/quiz-data.js","js/quiz-data2.js","js/quiz-data3.js","js/quiz.js","js/admin.js","js/house.js","js/notify.js","js/native.js","vendor/supabase-2.117.3.js","privacy.html","manifest.webmanifest","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request);
    const net=fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin)c.put(e.request,r.clone());return r}).catch(()=>hit);
    return hit||net}))});
