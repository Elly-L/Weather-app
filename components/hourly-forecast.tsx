import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CloudRain, Sun, Cloud, Wind } from "lucide-react"

interface HourlyForecastProps {
  hourlyData: any[]
  t: (key: string) => string
}

export function HourlyForecast({ hourlyData, t }: HourlyForecastProps) {
  const getWeatherIcon = (main: string) => {
    switch (main) {
      case "Rain":
        return <CloudRain className="h-6 w-6 text-blue-600" />
      case "Clear":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "Clouds":
        return <Cloud className="h-6 w-6 text-gray-500" />
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

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hourly Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {hourlyData.slice(0, 24).map((hour, index) => {
            const time = new Date(hour.dt * 1000)
            const isNow = index === 0

            return (
              <div
                key={index}
                className={`flex-shrink-0 text-center p-3 rounded-lg min-w-[80px] ${
                  isNow ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50"
                }`}
              >
                <p className="text-xs font-medium mb-2">
                  {isNow ? "Now" : time.toLocaleTimeString("en-US", { hour: "numeric" })}
                </p>
                <div className="flex justify-center mb-2">{getWeatherIcon(hour.weather[0].main)}</div>
                <p className={`text-sm font-bold ${getTemperatureColor(hour.main.temp)}`}>
                  {Math.round(hour.main.temp)}°
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Wind className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600">{Math.round(hour.wind.speed * 3.6)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{hour.pop ? `${Math.round(hour.pop * 100)}%` : ""}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
