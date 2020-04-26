const filesToCache = [
  "/",
  "index.html",
  "pwa.html",
  "pwa-upload.html",
  "pwa-auth.html",
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

const broadcast = new BroadcastChannel("channel");
let shared = null;
let authedUntil = Date.now();

broadcast.onmessage = () => {
  broadcast.postMessage(shared && shared.name);
};

self.addEventListener("fetch", async (event) => {
  console.log("Fetch event for ", event.request.url);

  // POST
  if (event.request.method === "POST") {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        if (formData.get("shared")) {
          // Redirect
          shared = formData.get("shared");
          const authed = await (await fetch("/auth")).json();
          if (authed.error) {
            return fetch("/pwa-auth.html");
          }
          return fetch(`/pwa-upload.html`);
        }
        if (formData.get("name") && shared) {
          // Fetch Request
          formData.append("file", shared);
          const response = await fetch("/upload", {
            credentials: "same-origin",
            body: formData,
            method: "post",
          });
          const data = await response.json();
          if (!data.error) {
            shared = null;
          }
          return new Response(JSON.stringify(data));
        }
      })()
    );
  }

  // GET - caching and auth
  if (event.request.method === "GET") {
    event.respondWith(
      (async () => {
        // Check auth on new pages
        if (event.request.url.match(/.*\.html.*/)) {
          if (authedUntil < Date.now() / 1000) {
            console.log("Auth expired");
            const authed = await (await fetch("/auth")).json();
            if (authed.error) {
              console.log("No saved auth - redirecting");
              return fetch("/pwa-auth.html");
            } else {
              console.log("Auth found - updating");
              authedUntil = authed.until;
            }
          }
        }

        // Do caching stuff
        const response = await caches.match(event.request);
        if (response) {
          console.log("Found ", event.request.url, " in cache");
          return response;
        }
        console.log("Network request for ", event.request.url);
        return fetch(event.request);
      })()
    );
  }
});
