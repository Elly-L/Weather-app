"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CloudRain, Sun, Cloud, Wind, CloudSnow, CloudDrizzle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface HourlyForecastProps {
  hourlyData: any[]
  t: (key: string) => string
  onHourSelect?: (hourData: any, time: Date) => void
}

export function HourlyForecast({ hourlyData, t, onHourSelect }: HourlyForecastProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null)

  const getWeatherIcon = (main: string, description: string) => {
    switch (main.toLowerCase()) {
      case "rain":
        return <CloudRain className="h-6 w-6 text-blue-600" />
      case "drizzle":
        return <CloudDrizzle className="h-6 w-6 text-blue-400" />
      case "clear":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "clouds":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "snow":
        return <CloudSnow className="h-6 w-6 text-blue-200" />
      case "thunderstorm":
        return <Zap className="h-6 w-6 text-purple-600" />
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />
    }
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 30) return "text-red-600"
    if (temp > 25) return "text-orange-500"
    if (temp > 20) return "text-green-600"
    return "text-blue-600"
  }

  const getCurrentHourIndex = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentTime = now.getTime()

    // Find the closest hour data point to current time
    let closestIndex = 0
    let minDiff = Number.POSITIVE_INFINITY

    for (let i = 0; i < hourlyData.length; i++) {
      const hourDate = new Date(hourlyData[i].dt * 1000)
      const diff = Math.abs(hourDate.getTime() - currentTime)

      if (diff < minDiff) {
        minDiff = diff
        closestIndex = i
      }
    }

    return closestIndex
  }

  const handleHourClick = (hourData: any, index: number) => {
    setSelectedHour(index)
    const time = new Date(hourData.dt * 1000)
    if (onHourSelect) {
      onHourSelect(hourData, time)
    }
  }

  const currentHourIndex = getCurrentHourIndex()

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hourly Forecast - Next 24 Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto gap-3 pb-4">
          {hourlyData.slice(0, 24).map((hour, index) => {
            const time = new Date(hour.dt * 1000)
            const now = new Date()
            const isNow = Math.abs(time.getTime() - now.getTime()) < 30 * 60 * 1000 // Within 30 minutes
            const isSelected = selectedHour === index
            const isPast = time < now

            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "ghost"}
                onClick={() => handleHourClick(hour, index)}
                className={`flex-shrink-0 flex flex-col items-center p-3 h-auto min-w-[90px] ${
                  isNow
                    ? "bg-blue-500 text-white border-2 border-blue-600"
                    : isSelected
                      ? "bg-blue-100 border-2 border-blue-400"
                      : isPast
                        ? "opacity-60"
                        : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <p className="text-xs font-medium mb-2">
                  {isNow
                    ? "Now"
                    : time.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                </p>

                <div className="flex justify-center mb-2">
                  {getWeatherIcon(hour.weather[0].main, hour.weather[0].description)}
                </div>

                <p className={`text-sm font-bold mb-1 ${getTemperatureColor(hour.main.temp)}`}>
                  {Math.round(hour.main.temp)}°C
                </p>

                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wind className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600">{Math.round(hour.wind.speed * 3.6)} km/h</p>
                </div>

                {hour.pop && hour.pop > 0.1 && (
                  <p className="text-xs text-blue-600 font-medium">{Math.round(hour.pop * 100)}% rain</p>
                )}

                <p className="text-xs text-gray-500 mt-1 text-center leading-tight">{hour.weather[0].description}</p>
              </Button>
            )
          })}
        </div>

        {selectedHour !== null && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              Weather Details for{" "}
              {new Date(hourlyData[selectedHour].dt * 1000).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                weekday: "short",
              })}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Temperature</p>
                <p className="font-semibold">{Math.round(hourlyData[selectedHour].main.temp)}°C</p>
                <p className="text-xs text-gray-500">
                  Feels like {Math.round(hourlyData[selectedHour].main.feels_like)}°C
                </p>
              </div>
              <div>
                <p className="text-gray-600">Humidity</p>
                <p className="font-semibold">{hourlyData[selectedHour].main.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-600">Wind</p>
                <p className="font-semibold">{Math.round(hourlyData[selectedHour].wind.speed * 3.6)} km/h</p>
              </div>
              <div>
                <p className="text-gray-600">Rain Chance</p>
                <p className="font-semibold">
                  {hourlyData[selectedHour].pop ? Math.round(hourlyData[selectedHour].pop * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
