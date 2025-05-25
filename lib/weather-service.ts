const API_KEY = "aaf24b72a506d1b340293042f47b0d8f"
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export class WeatherService {
  static async getCurrentWeather(city: string) {
    try {
      const response = await fetch(`${BASE_URL}/weather?q=${city},KE&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Weather data not available")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching current weather:", error)
      throw error
    }
  }

  static async getCurrentWeatherByCoords(lat: number, lon: number) {
    try {
      const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Weather data not available")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching current weather by coords:", error)
      throw error
    }
  }

  static async getForecast(city: string) {
    try {
      const response = await fetch(`${BASE_URL}/forecast?q=${city},KE&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Forecast data not available")
      }

      const data = await response.json()

      // Group by day and get daily forecasts
      const dailyForecasts = []
      const processedDays = new Set()

      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toDateString()
        if (!processedDays.has(date)) {
          dailyForecasts.push(item)
          processedDays.add(date)
        }
        if (dailyForecasts.length >= 5) break
      }

      return dailyForecasts
    } catch (error) {
      console.error("Error fetching forecast:", error)
      throw error
    }
  }

  static async getForecastByCoords(lat: number, lon: number) {
    try {
      const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Forecast data not available")
      }

      const data = await response.json()

      // Group by day and get daily forecasts
      const dailyForecasts = []
      const processedDays = new Set()

      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toDateString()
        if (!processedDays.has(date)) {
          dailyForecasts.push(item)
          processedDays.add(date)
        }
        if (dailyForecasts.length >= 5) break
      }

      return dailyForecasts
    } catch (error) {
      console.error("Error fetching forecast by coords:", error)
      throw error
    }
  }

  static async getHourlyForecast(city: string) {
    try {
      const response = await fetch(`${BASE_URL}/forecast?q=${city},KE&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Hourly forecast data not available")
      }

      const data = await response.json()
      return data.list.slice(0, 24) // Return next 24 hours
    } catch (error) {
      console.error("Error fetching hourly forecast:", error)
      throw error
    }
  }

  static async getHourlyForecastByCoords(lat: number, lon: number) {
    try {
      const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Hourly forecast data not available")
      }

      const data = await response.json()
      return data.list.slice(0, 24) // Return next 24 hours
    } catch (error) {
      console.error("Error fetching hourly forecast by coords:", error)
      throw error
    }
  }

  static async getWeatherAlerts(city: string) {
    try {
      const forecast = await this.getForecast(city)
      const alerts = []

      for (const item of forecast) {
        const weather = item.weather[0]
        const temp = item.main.temp
        const time = new Date(item.dt * 1000)

        if (weather.main === "Rain") {
          alerts.push({
            type: "rain",
            message: `Rain expected at ${time.toLocaleTimeString()}`,
            time: time,
            severity: "medium",
          })
        }

        if (temp > 35) {
          alerts.push({
            type: "heat",
            message: `Very hot weather expected (${Math.round(temp)}°C)`,
            time: time,
            severity: "high",
          })
        }

        if (temp < 10) {
          alerts.push({
            type: "cold",
            message: `Cold weather expected (${Math.round(temp)}°C)`,
            time: time,
            severity: "medium",
          })
        }
      }

      return alerts
    } catch (error) {
      console.error("Error getting weather alerts:", error)
      return []
    }
  }
}
