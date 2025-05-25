// Service Worker for offline functionality and push notifications

const CACHE_NAME = "kenya-weather-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: "view",
          title: "View Details",
          icon: "/icon-192x192.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
      tag: data.tag || "weather-notification",
      requireInteraction: true,
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/"))
  } else if (event.action === "dismiss") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"))
  }
})

// Background sync for offline notifications
self.addEventListener("sync", (event) => {
  if (event.tag === "weather-sync") {
    event.waitUntil(processOfflineNotifications())
  }
})

async function processOfflineNotifications() {
  try {
    // Get scheduled notifications from storage
    const notifications = JSON.parse(localStorage.getItem("scheduledNotifications") || "[]")
    const now = Date.now()

    for (const notification of notifications) {
      if (notification.timestamp <= now && notification.timestamp > now - 60000) {
        // Show notification if it's time (within last minute)
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          data: notification.data,
          tag: notification.tag,
        })
      }
    }

    // Clean up old notifications
    const activeNotifications = notifications.filter((n) => n.timestamp > now)
    localStorage.setItem("scheduledNotifications", JSON.stringify(activeNotifications))
  } catch (error) {
    console.error("Error processing offline notifications:", error)
  }
}

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "weather-update") {
    event.waitUntil(updateWeatherData())
  }
})

async function updateWeatherData() {
  try {
    // This would fetch fresh weather data and update cache
    // Implementation depends on your specific needs
    console.log("Updating weather data in background")
  } catch (error) {
    console.error("Error updating weather data:", error)
  }
}
