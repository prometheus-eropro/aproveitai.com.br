const CACHE_NAME = "aproveitai-cache-v2";
const FILES_TO_CACHE = [
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/favicon.ico",
  "/logo-aproveitai.png",
  "/logo-prometheus.png",
  "/painelcliente.html",
  "/beneficios.html",
  "/promocoes.html",
  "/depoimentos.html",
  "/cartao.html"
];

// Instala e guarda cache
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições e tenta offline
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      return response || fetch(evt.request);
    })
  );
});
