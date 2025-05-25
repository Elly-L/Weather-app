export class NotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null

  static async init() {
    if ("serviceWorker" in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker registered successfully")
      } catch (error) {
        console.error("Service Worker registration failed:", error)
      }
    }
  }

  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  static async scheduleWeatherAlerts(forecast: any[], userName: string) {
    if (!this.swRegistration || Notification.permission !== "granted") {
      return
    }

    // Clear existing notifications
    const notifications = await this.swRegistration.getNotifications()
    notifications.forEach((notification) => notification.close())

    // Schedule new notifications
    for (const item of forecast) {
      const weather = item.weather[0]
      const temp = item.main.temp
      const time = new Date(item.dt * 1000)
      const now = new Date()

      // Schedule notification 2 hours before rain
      if (weather.main === "Rain" && time > now) {
        const notificationTime = new Date(time.getTime() - 2 * 60 * 60 * 1000) // 2 hours before

        if (notificationTime > now) {
          this.scheduleNotification({
            title: `Hey ${userName}! Rain Alert 🌧️`,
            body: `Rain expected at ${time.toLocaleTimeString()}. Don't forget your umbrella!`,
            icon: "/icon-192x192.png",
            badge: "/badge-72x72.png",
            tag: `rain-${time.getTime()}`,
            timestamp: notificationTime.getTime(),
            data: {
              type: "rain",
              time: time.toISOString(),
              recommendations: ["umbrella", "raincoat"],
            },
          })
        }
      }

      // Schedule notification for extreme temperatures
      if (temp > 30 && time > now) {
        const notificationTime = new Date(time.getTime() - 1 * 60 * 60 * 1000) // 1 hour before

        if (notificationTime > now) {
          this.scheduleNotification({
            title: `${userName}, Hot Weather Alert! 🌡️`,
            body: `Very hot weather (${Math.round(temp)}°C) expected. Stay hydrated and wear light clothing!`,
            icon: "/icon-192x192.png",
            badge: "/badge-72x72.png",
            tag: `heat-${time.getTime()}`,
            timestamp: notificationTime.getTime(),
            data: {
              type: "heat",
              temperature: temp,
              recommendations: ["water", "light-clothing", "sunscreen"],
            },
          })
        }
      }
    }
  }

  private static scheduleNotification(options: any) {
    // Store notification in localStorage for the service worker to process
    const notifications = JSON.parse(localStorage.getItem("scheduledNotifications") || "[]")
    notifications.push(options)
    localStorage.setItem("scheduledNotifications", JSON.stringify(notifications))

    // Set timeout for immediate notifications (within next 24 hours)
    const delay = options.timestamp - Date.now()
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        this.showNotification(options)
      }, delay)
    }
  }

  private static async showNotification(options: any) {
    if (this.swRegistration && Notification.permission === "granted") {
      await this.swRegistration.showNotification(options.title, {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        vibrate: [200, 100, 200],
        actions: [
          {
            action: "view",
            title: "View Details",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ],
      })
    }
  }

  static async sendTestNotification(userName: string) {
    if (Notification.permission === "granted") {
      this.showNotification({
        title: `Hello ${userName}! 👋`,
        body: "Weather notifications are now active. You'll receive alerts before weather changes.",
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: "test-notification",
      })
    }
  }
}
