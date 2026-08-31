const CACHE_NAME = 'second-wind-v3';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const OFFLINE_HTML = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Второе Дыхание — офлайн</title>
<style>
body{margin:0;background:#0F1115;color:#EDEAE3;font-family:sans-serif;
display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:24px;}
div{max-width:320px;}
h1{font-size:19px;margin-bottom:10px;}
p{color:#9A968C;font-size:14px;line-height:1.6;}
</style></head><body>
<div><h1>Нет соединения</h1><p>Страница ещё не была загружена в этом браузере при подключении к интернету. Подключитесь к сети и откройте приложение ещё раз.</p></div>
</body></html>`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const isHTML = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((cached) =>
            cached || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
          )
        )
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
