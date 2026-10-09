// Timesheet personale — service worker: rende l'app disponibile offline.
// Non legge né invia i tuoi dati: mette in cache solo i file dell'app.
const CACHE = 'timesheet-app-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (req.mode === 'navigate'){
    // prima la rete (così ricevi gli aggiornamenti), altrimenti la copia offline
    e.respondWith(fetch(req).then(r => { if (r.ok && r.type === 'basic' && !r.redirected){ const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); } return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { if (res.ok && res.type === 'basic'){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; })));
});
