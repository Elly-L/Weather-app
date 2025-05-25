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
        if (dailyForecasts.length >= 7) break
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
        if (dailyForecasts.length >= 7) break
      }

      return dailyForecasts
    } catch (error) {
      console.error("Error fetching forecast by coords:", error)
      throw error
    }
  }

  static async getDetailedHourlyForecast(city: string) {
    try {
      const response = await fetch(`${BASE_URL}/forecast?q=${city},KE&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Hourly forecast data not available")
      }

      const data = await response.json()
      const now = new Date()
      const currentHour = now.getHours()

      // Get all hourly data for next 48 hours
      const hourlyData = []

      // Start from current hour
      const startTime = new Date(now)
      startTime.setMinutes(0, 0, 0) // Round to current hour

      // Process each 3-hour interval from the API
      for (let i = 0; i < Math.min(data.list.length, 16); i++) {
        const item = data.list[i]
        const itemTime = new Date(item.dt * 1000)

        // Add the original 3-hour data point
        hourlyData.push(item)

        // Interpolate 2 additional hours between this and next data point
        if (i < data.list.length - 1) {
          const nextItem = data.list[i + 1]
          const nextTime = new Date(nextItem.dt * 1000)

          for (let h = 1; h <= 2; h++) {
            const interpolatedTime = new Date(itemTime.getTime() + h * 60 * 60 * 1000)
            if (interpolatedTime <= nextTime) {
              // Create interpolated weather data
              const interpolatedData = {
                ...item,
                dt: Math.floor(interpolatedTime.getTime() / 1000),
                main: {
                  ...item.main,
                  temp: item.main.temp + (nextItem.main.temp - item.main.temp) * (h / 3),
                  feels_like: item.main.feels_like + (nextItem.main.feels_like - item.main.feels_like) * (h / 3),
                  humidity: Math.round(item.main.humidity + (nextItem.main.humidity - item.main.humidity) * (h / 3)),
                  pressure: Math.round(item.main.pressure + (nextItem.main.pressure - item.main.pressure) * (h / 3)),
                },
                wind: {
                  ...item.wind,
                  speed: item.wind.speed + (nextItem.wind.speed - item.wind.speed) * (h / 3),
                },
                pop: item.pop ? item.pop + (nextItem.pop - item.pop) * (h / 3) : 0,
              }
              hourlyData.push(interpolatedData)
            }
          }
        }
      }

      // Sort by time and filter to show from current hour onwards
      const sortedData = hourlyData.sort((a, b) => a.dt - b.dt)

      // Filter to start from current time or next available hour
      const filteredData = sortedData.filter((item) => {
        const itemTime = new Date(item.dt * 1000)
        return itemTime >= startTime
      })

      return filteredData.slice(0, 48)
    } catch (error) {
      console.error("Error fetching detailed hourly forecast:", error)
      throw error
    }
  }

  static async getDetailedHourlyForecastByCoords(lat: number, lon: number) {
    try {
      const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error("Hourly forecast data not available")
      }

      const data = await response.json()
      const now = new Date()

      // Get all hourly data for next 48 hours
      const hourlyData = []

      // Start from current hour
      const startTime = new Date(now)
      startTime.setMinutes(0, 0, 0) // Round to current hour

      // Process each 3-hour interval from the API
      for (let i = 0; i < Math.min(data.list.length, 16); i++) {
        const item = data.list[i]
        const itemTime = new Date(item.dt * 1000)

        // Add the original 3-hour data point
        hourlyData.push(item)

        // Interpolate 2 additional hours between this and next data point
        if (i < data.list.length - 1) {
          const nextItem = data.list[i + 1]
          const nextTime = new Date(nextItem.dt * 1000)

          for (let h = 1; h <= 2; h++) {
            const interpolatedTime = new Date(itemTime.getTime() + h * 60 * 60 * 1000)
            if (interpolatedTime <= nextTime) {
              // Create interpolated weather data
              const interpolatedData = {
                ...item,
                dt: Math.floor(interpolatedTime.getTime() / 1000),
                main: {
                  ...item.main,
                  temp: item.main.temp + (nextItem.main.temp - item.main.temp) * (h / 3),
                  feels_like: item.main.feels_like + (nextItem.main.feels_like - item.main.feels_like) * (h / 3),
                  humidity: Math.round(item.main.humidity + (nextItem.main.humidity - item.main.humidity) * (h / 3)),
                  pressure: Math.round(item.main.pressure + (nextItem.main.pressure - item.main.pressure) * (h / 3)),
                },
                wind: {
                  ...item.wind,
                  speed: item.wind.speed + (nextItem.wind.speed - item.wind.speed) * (h / 3),
                },
                pop: item.pop ? item.pop + (nextItem.pop - item.pop) * (h / 3) : 0,
              }
              hourlyData.push(interpolatedData)
            }
          }
        }
      }

      // Sort by time and filter to show from current hour onwards
      const sortedData = hourlyData.sort((a, b) => a.dt - b.dt)

      // Filter to start from current time or next available hour
      const filteredData = sortedData.filter((item) => {
        const itemTime = new Date(item.dt * 1000)
        return itemTime >= startTime
      })

      return filteredData.slice(0, 48)
    } catch (error) {
      console.error("Error fetching detailed hourly forecast by coords:", error)
      throw error
    }
  }

  // Legacy methods for backward compatibility
  static async getHourlyForecast(city: string) {
    return this.getDetailedHourlyForecast(city)
  }

  static async getHourlyForecastByCoords(lat: number, lon: number) {
    return this.getDetailedHourlyForecastByCoords(lat, lon)
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
