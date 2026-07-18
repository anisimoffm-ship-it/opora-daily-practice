self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil((async () => {
    const clientList = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const origin = self.location.origin;
    const url = new URL(targetUrl, origin).href;

    for (const client of clientList) {
      if ("focus" in client && client.url.startsWith(origin)) {
        await client.focus();
        if ("navigate" in client) {
          await client.navigate(url);
        }
        return;
      }
    }

    await clients.openWindow(url);
  })());
});
