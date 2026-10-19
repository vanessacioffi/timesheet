// Timesheet personale — service worker: rende l'app disponibile offline.
// Non legge né invia i tuoi dati: mette in cache solo i file dell'app.
// v4: tutti i file dell'app (pagina, icone, manifest) passano prima dalla rete,
// così ogni aggiornamento caricato su GitHub arriva subito; la copia salvata serve solo offline.
const CACHE = 'timesheet-app-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(a => new Request(a, {cache:'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  e.respondWith(fetch(req, {cache:'no-cache'}).then(r => {
    if (r.ok && r.type === 'basic' && !r.redirected){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(nav ? './index.html' : req, cp)); }
    return r;
  }).catch(() => caches.match(nav ? './index.html' : req)));
});
