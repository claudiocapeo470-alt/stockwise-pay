/* Stocknix — gestion des notifications push (importé par le service worker généré) */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Stocknix", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Stocknix";
  const options = {
    body: data.body || "",
    icon: data.icon || "/stocknix-logo-official.png",
    badge: data.badge || "/stocknix-logo-official.png",
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    data: { url: data.url || "/app" },
    vibrate: [80, 40, 80],
    requireInteraction: data.requireInteraction === true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/app";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {
              /* navigation refusée : on garde la fenêtre focalisée */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(targetUrl);
    })(),
  );
});
