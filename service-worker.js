const CACHE_NAME = "zona-grupera-v1";

const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo.jpeg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARCHIVOS_APP);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres
          .filter(function (nombre) {
            return nombre !== CACHE_NAME;
          })
          .map(function (nombre) {
            return caches.delete(nombre);
          })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (evento) {
  const solicitud = evento.request;
  const url = new URL(solicitud.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (solicitud.mode === "navigate") {
    evento.respondWith(
      fetch(solicitud).catch(function () {
        return caches.match("./index.html");
      })
    );
    return;
  }

  evento.respondWith(
    caches.match(solicitud).then(function (respuestaGuardada) {
      return (
        respuestaGuardada ||
        fetch(solicitud).then(function (respuestaRed) {
          const copia = respuestaRed.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(solicitud, copia);
          });

          return respuestaRed;
        })
      );
    })
  );
});
