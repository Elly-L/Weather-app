import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Eye, Clock, Calendar } from "lucide-react"

interface WeatherCardProps {
  weather: any
  city: string
  t: (key: string) => string
  viewMode?: "current" | "hourly" | "daily"
  hourlyTime?: Date
  dailyDate?: Date
}

export function WeatherCard({ weather, city, t, viewMode = "current", hourlyTime, dailyDate }: WeatherCardProps) {
  const getWeatherIcon = (main: string) => {
    switch (main) {
      case "Rain":
        return <CloudRain className="h-12 w-12 text-blue-600" />
      case "Clear":
        return <Sun className="h-12 w-12 text-yellow-500" />
      case "Clouds":
        return <Cloud className="h-12 w-12 text-gray-500" />
      default:
        return <Cloud className="h-12 w-12 text-gray-500" />
    }
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 30) return "text-red-600"
    if (temp > 25) return "text-orange-500"
    if (temp > 20) return "text-green-600"
    return "text-blue-600"
  }

  const getTimeDisplay = () => {
    const now = new Date()

    if (viewMode === "hourly" && hourlyTime) {
      return hourlyTime.toLocaleString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    }
    if (viewMode === "daily" && dailyDate) {
      return dailyDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }

    // Show current accurate time for current view
    return now.toLocaleString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getViewModeIcon = () => {
    if (viewMode === "hourly") return <Clock className="h-3 w-3" />
    if (viewMode === "daily") return <Calendar className="h-3 w-3" />
    return null
  }

  const getViewModeLabel = () => {
    if (viewMode === "hourly") return "Hourly Forecast: "
    if (viewMode === "daily") return "Daily Forecast: "
    return ""
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{city}</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            {getViewModeIcon()}
            {getTimeDisplay()}
          </Badge>
        </CardTitle>
        <CardDescription className="capitalize">
          {getViewModeLabel()}
          {weather.weather[0].description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.weather[0].main)}
            <div>
              <div className={`text-4xl font-bold ${getTemperatureColor(weather.main.temp)}`}>
                {Math.round(weather.main.temp)}°C
              </div>
              <div className="text-sm text-gray-600">
                {t("feelsLike")} {Math.round(weather.main.feels_like)}°C
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">{t("humidity")}</p>
              <p className="font-medium">{weather.main.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">{t("wind")}</p>
              <p className="font-medium">{Math.round(weather.wind.speed * 3.6)} km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">{t("pressure")}</p>
              <p className="font-medium">{weather.main.pressure} hPa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">{t("visibility")}</p>
              <p className="font-medium">{weather.visibility ? (weather.visibility / 1000).toFixed(1) : "N/A"} km</p>
            </div>
          </div>
        </div>

        {weather.pop && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Rain Probability:</strong> {Math.round(weather.pop * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
