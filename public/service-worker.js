const filesToCache = [
  "/",
  "index.html",
  "favicon.ico",
  "icon-512.png",
  "icon-192.png",
  "manifest.webmanifest",
  "bulma.css",
];
const staticCacheName = "strava-upload-cache-v1";

self.addEventListener("install", function (event) {
  console.log("Attempting to install service worker and cache static assets");
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("Activating new service worker...");

  const cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", async (event) => {
  console.log("Fetch event for ", event.request.url);

  if (event.request.method === "POST") {
    const formData = await event.request.formData();
    console.log(formData);
    return;
  }

  // GET
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          console.log("Found ", event.request.url, " in cache");
          return response;
        }
        console.log("Network request for ", event.request.url);
        return fetch(event.request);
      })
      .catch((error) => {})
  );
});
