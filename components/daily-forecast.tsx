"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CloudRain, Sun, Cloud, Wind, CloudSnow, CloudDrizzle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface DailyForecastProps {
  dailyData: any[]
  t: (key: string) => string
  onDaySelect?: (dayData: any, date: Date) => void
}

export function DailyForecast({ dailyData, t, onDaySelect }: DailyForecastProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const getWeatherIcon = (main: string, description: string) => {
    switch (main.toLowerCase()) {
      case "rain":
        return <CloudRain className="h-8 w-8 text-blue-600" />
      case "drizzle":
        return <CloudDrizzle className="h-8 w-8 text-blue-400" />
      case "clear":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "clouds":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "snow":
        return <CloudSnow className="h-8 w-8 text-blue-200" />
      case "thunderstorm":
        return <Zap className="h-8 w-8 text-purple-600" />
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />
    }
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 30) return "text-red-600"
    if (temp > 25) return "text-orange-500"
    if (temp > 20) return "text-green-600"
    return "text-blue-600"
  }

  const handleDayClick = (dayData: any, index: number) => {
    setSelectedDay(index)
    const date = new Date(dayData.dt * 1000)
    if (onDaySelect) {
      onDaySelect(dayData, date)
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

  const getDayLabel = (date: Date, index: number) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {dailyData.slice(0, 7).map((day, index) => {
            const date = new Date(day.dt * 1000)
            const isSelected = selectedDay === index
            const todayClass = isToday(date)

            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "ghost"}
                onClick={() => handleDayClick(day, index)}
                className={`flex flex-col items-center p-4 h-auto ${
                  todayClass
                    ? "bg-blue-500 text-white border-2 border-blue-600"
                    : isSelected
                      ? "bg-blue-100 border-2 border-blue-400"
                      : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <p className="text-sm font-medium mb-2">{getDayLabel(date, index)}</p>

                <p className="text-xs text-gray-600 mb-2">
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>

                <div className="flex justify-center mb-3">
                  {getWeatherIcon(day.weather[0].main, day.weather[0].description)}
                </div>

                <div className="text-center mb-2">
                  <p className={`text-lg font-bold ${getTemperatureColor(day.main.temp)}`}>
                    {Math.round(day.main.temp)}°
                  </p>
                  <p className="text-xs text-gray-600">{Math.round(day.main.temp_min || day.main.temp - 3)}°</p>
                </div>

                <div className="flex items-center justify-center gap-1 mb-2">
                  <Wind className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600">{Math.round(day.wind.speed * 3.6)} km/h</p>
                </div>

                {day.pop && day.pop > 0.1 && (
                  <p className="text-xs text-blue-600 font-medium">{Math.round(day.pop * 100)}%</p>
                )}

                <p className="text-xs text-gray-500 mt-1 text-center leading-tight">{day.weather[0].description}</p>
              </Button>
            )
          })}
        </div>

        {selectedDay !== null && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">
              Weather Details for{" "}
              {new Date(dailyData[selectedDay].dt * 1000).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Temperature</p>
                <p className="font-semibold">{Math.round(dailyData[selectedDay].main.temp)}°C</p>
                <p className="text-xs text-gray-500">
                  Feels like {Math.round(dailyData[selectedDay].main.feels_like)}°C
                </p>
              </div>
              <div>
                <p className="text-gray-600">Humidity</p>
                <p className="font-semibold">{dailyData[selectedDay].main.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-600">Wind</p>
                <p className="font-semibold">{Math.round(dailyData[selectedDay].wind.speed * 3.6)} km/h</p>
              </div>
              <div>
                <p className="text-gray-600">Rain Chance</p>
                <p className="font-semibold">
                  {dailyData[selectedDay].pop ? Math.round(dailyData[selectedDay].pop * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-gray-600">Conditions</p>
              <p className="font-semibold capitalize">{dailyData[selectedDay].weather[0].description}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
