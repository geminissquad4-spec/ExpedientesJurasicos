/* ==========================================================================
   EXPEDIENTES JURÁSICOS - SERVICE WORKER OFFLINE (PWA)
   Arquitectura de Caché Híbrida:
   1. Pre-caching del App Shell (código, estilos, fuentes, minijuegos e iconos).
   2. Runtime Caching (Cache-First) para recursos multimedia (imágenes, audios).
   3. Manejo de Range Requests para compatibilidad con audio/video en Safari y Chrome.
   4. Modo Offline garantizado sin conexión a internet.
   ========================================================================== */

const CACHE_NAME = 'ej-appshell-v1';
const RUNTIME_CACHE = 'ej-runtime-v1';

// Recursos críticos precacheados en la instalación
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./maintenance.css",
  "./mobile-minigames.css",
  "./fonts/fonts.css",
  "./manifest.json",
  "./maintenance-config.js",
  "./maintenance-system.js",
  "./cronologia-data.js",
  "./species-data-1.js",
  "./species-data-2.js",
  "./species-data-3.js",
  "./fichas-data.js",
  "./prints-data.js",
  "./species-scale-data.js",
  "./species-scale.js",
  "./script.js",
  "./pwa-manager.js",
  "./site-access-system.js",
  "./compy-easter-egg.js",
  "./no-te-muevas.js",
  "./raptor-attack.js",
  "./venomous-spitter.js",
  "./sick-trike.js",
  "./plesio-swim.js",
  "./styraco-strike.js",
  "./carno-search.js",
  "./identifica-especie.js",
  "./cueva-baryonyx.js",
  "./escape-de-sorna.js",
  "./ahuyentando-ornithos.js",
  "./escapa-cryolophosaurus.js",
  "./hibridacion-adn.js",
  "./captura-giganotosaurus.js",
  "./encontrando-quetzalcoatlus.js",
  "./logo.jpg",
  "./Expedientes Jurásicos logo.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/favicon-16.png",
  "./fonts/J7aHnp1uDWRBEqV98dVQztYldFcLowEF.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pa8FvOleef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pa8FvOqeef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pa8FvOreec.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pasEfOleef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pasEfOqeef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pasEfOreec.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pb0EPOleef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pb0EPOqeef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pb0EPOreec.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pbYF_Oleef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pbYF_Oqeef2kg.woff2",
  "./fonts/LDI2apCSOBg7S-QT7pbYF_Oreec.woff2",
  "./fonts/LDIxapCSOBg7S-QT7p4GM-aUWA.woff2",
  "./fonts/LDIxapCSOBg7S-QT7p4HM-Y.woff2",
  "./fonts/LDIxapCSOBg7S-QT7p4JM-aUWA.woff2",
  "./fonts/yMJRMIlzdpvBhQQL_Qq7dy0.woff2"
];

// 1. INSTALACIÓN: Precargar el App Shell en lotes seguros (HTTP/1.1 friendly)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const batchSize = 6;
      for (let i = 0; i < APP_SHELL.length; i += batchSize) {
        const batch = APP_SHELL.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (url) => {
            try {
              const response = await fetch(url, { cache: 'no-cache' });
              if (response.ok) {
                await cache.put(url, response);
              }
            } catch (err) {
              console.warn('[SW] No se pudo precachear:', url, err);
            }
          })
        );
      }
      console.log('[SW] App Shell jurásico precacheado exitosamente (' + APP_SHELL.length + ' recursos).');
    })
  );
});

// 2. ACTIVACIÓN: Limpiar cachés antiguas y tomar control inmediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== RUNTIME_CACHE) {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPTOR DE PETICIONES (FETCH)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo interceptar peticiones http/https del mismo origen
  if (!url.protocol.startsWith('http')) return;

  // Manejo de peticiones de navegación (HTML principal)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => {
        return cached || fetch(req).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // Manejo de peticiones Range (Audio / Video)
  if (req.headers.has('range')) {
    event.respondWith(
      caches.match(req.url, { ignoreSearch: true }).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(req).then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req.url, clone));
          }
          return response;
        }).catch(() => {
          return caches.match(req.url, { ignoreSearch: true });
        });
      })
    );
    return;
  }

  // Estrategia Cache-First para el resto de recursos (App Shell, Scripts, Imágenes, Audios)
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en caché, buscar en la red y almacenar en RUNTIME_CACHE
      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return null;
      });
    })
  );
});

// 4. MENSAJERÍA DIRECTA CON LA APLICACIÓN
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
