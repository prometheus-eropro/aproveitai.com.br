// =====================================================
// APROVEITAI — SERVICE WORKER
// MODO DESENVOLVIMENTO / SEM CACHE
// =====================================================
//
// Objetivo:
// - não interferir nas chamadas do Google Apps Script;
// - não interceptar JSONP;
// - não causar problemas de CORS;
// - não manter arquivos antigos em cache;
// - assumir imediatamente a nova versão.
//
// =====================================================

self.addEventListener("install", (event) => {

  console.log("[AproveitAI SW] Instalando nova versão");

  self.skipWaiting();

});


self.addEventListener("activate", (event) => {

  console.log("[AproveitAI SW] Ativando nova versão");

  event.waitUntil(

    caches.keys()

      .then((keys) => {

        return Promise.all(

          keys.map((key) => {

            console.log(
              "[AproveitAI SW] Removendo cache:",
              key
            );

            return caches.delete(key);

          })

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


// =====================================================
// IMPORTANTE
// =====================================================
//
// NÃO criar listener "fetch" aqui.
//
// As requisições seguem diretamente pelo navegador.
//
// Isso é especialmente importante para:
//
// script.google.com
// script.googleusercontent.com
// JSONP do Apps Script
// imagens externas do Google Drive
//
// =====================================================