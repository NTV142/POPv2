// sw.js
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // index.htmlから渡されたURL、またはデフォルト
    let targetUrl = event.notification.data ? event.notification.data.url : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
