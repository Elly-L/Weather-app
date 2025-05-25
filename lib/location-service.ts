export class LocationService {
  static async getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  static async getCityName(lat: number, lon: number): Promise<string> {
    try {
      const API_KEY = "aaf24b72a506d1b340293042f47b0d8f"
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("Unable to get city name")
      }

      const data = await response.json()
      if (data && data.length > 0) {
        return data[0].name || "Unknown Location"
      }

      return "Unknown Location"
    } catch (error) {
      console.error("Error getting city name:", error)
      return "Current Location"
    }
  }

  static async watchPosition(callback: (position: { lat: number; lon: number }) => void): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error watching position:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )

      resolve(watchId)
    })
  }

  static clearWatch(watchId: number) {
    navigator.geolocation.clearWatch(watchId)
  }
}
