import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Umbrella, Shirt, Droplets, GlassesIcon as Sunglasses, Wind } from "lucide-react"

interface RecommendationCardProps {
  weather: any
  userName: string
  t: (key: string) => string
}

export function RecommendationCard({ weather, userName, t }: RecommendationCardProps) {
  const getRecommendations = () => {
    const temp = weather.main.temp
    const humidity = weather.main.humidity
    const windSpeed = weather.wind.speed * 3.6
    const weatherMain = weather.weather[0].main
    const recommendations = []

    if (temp > 30) {
      recommendations.push({
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
        title: t("stayHydrated"),
        description: t("stayHydratedDesc"),
        priority: "high",
      })
      recommendations.push({
        icon: <Shirt className="h-5 w-5 text-orange-500" />,
        title: t("lightClothing"),
        description: t("lightClothingDesc"),
        priority: "medium",
      })
      recommendations.push({
        icon: <Sunglasses className="h-5 w-5 text-yellow-500" />,
        title: t("sunProtection"),
        description: t("sunProtectionDesc"),
        priority: "medium",
      })
    } else if (temp < 15) {
      recommendations.push({
        icon: <Shirt className="h-5 w-5 text-blue-600" />,
        title: t("warmClothing"),
        description: t("warmClothingDesc"),
        priority: "high",
      })
    } else if (temp >= 15 && temp <= 25) {
      recommendations.push({
        icon: <Shirt className="h-5 w-5 text-green-600" />,
        title: t("comfortableWeather"),
        description: t("comfortableWeatherDesc"),
        priority: "low",
      })
    }

    if (weatherMain === "Rain" || humidity > 80) {
      recommendations.push({
        icon: <Umbrella className="h-5 w-5 text-blue-600" />,
        title: t("rainProtection"),
        description: t("rainProtectionDesc"),
        priority: "high",
      })
    }

    if (windSpeed > 20) {
      recommendations.push({
        icon: <Wind className="h-5 w-5 text-gray-600" />,
        title: t("windyConditions"),
        description: t("windyConditionsDesc"),
        priority: "medium",
      })
    }

    if (humidity > 70 && temp > 25) {
      recommendations.push({
        icon: <Droplets className="h-5 w-5 text-blue-400" />,
        title: t("highHumidity"),
        description: t("highHumidityDesc"),
        priority: "medium",
      })
    }

    return recommendations
  }

  const recommendations = getRecommendations()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          {t("recommendationsFor")} {userName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              {rec.icon}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                    {t(rec.priority)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No specific recommendations for current weather conditions.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
