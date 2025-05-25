"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Cloud, CloudRain, Sun, Mic, MicOff, Bell, MapPin, Volume2, VolumeX } from "lucide-react"
import { WeatherCard } from "@/components/weather-card"
import { RecommendationCard } from "@/components/recommendation-card"
import { VoiceCommands } from "@/components/voice-commands"
import { NotificationSetup } from "@/components/notification-setup"
import { HourlyForecast } from "@/components/hourly-forecast"
import { WeatherService } from "@/lib/weather-service"
import { NotificationService } from "@/lib/notification-service"
import { VoiceService } from "@/lib/voice-service"
import { LocationService } from "@/lib/location-service"
import { WeatherAnimation } from "@/components/weather-animations"
import { WeatherSounds } from "@/components/weather-sounds"
import { type translations, getTranslation, type Language } from "@/lib/translations"
import Image from "next/image"

const KENYA_CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Kakamega",
  "Juja",
  "Ruiru",
  "Naivasha",
  "Kilimani",
  "Kasarani",
  "Westlands",
  "Karen",
  "Langata",
  "Embakasi",
  "Kiambu",
]

export default function EltekWeatherApp() {
  const [userName, setUserName] = useState("")
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [selectedCity, setSelectedCity] = useState("Nairobi")
  const [weatherData, setWeatherData] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationName, setLocationName] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [weatherTheme, setWeatherTheme] = useState("default")

  const t = (key: keyof typeof translations.en) => getTranslation(key, language)

  useEffect(() => {
    // Check if user has visited before
    const storedName = localStorage.getItem("userName")
    const hasVisited = localStorage.getItem("hasVisited")

    if (storedName && hasVisited) {
      setUserName(storedName)
      setIsFirstTime(false)
      requestLocation()
    }

    // Initialize services
    NotificationService.init()
    VoiceService.init()
  }, [])

  const requestLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation()
      setCurrentLocation(location)
      const cityName = await LocationService.getCityName(location.lat, location.lon)
      setLocationName(cityName)
      loadWeatherDataByCoords(location.lat, location.lon, cityName)
    } catch (error) {
      console.error("Location error:", error)
      loadWeatherData("Nairobi")
    }
  }

  const handleFirstTimeSetup = (name: string) => {
    setUserName(name)
    setIsFirstTime(false)
    localStorage.setItem("userName", name)
    localStorage.setItem("hasVisited", "true")
    requestLocation()
  }

  const loadWeatherData = async (city: string) => {
    setLoading(true)
    try {
      const weather = await WeatherService.getCurrentWeather(city)
      const forecastData = await WeatherService.getForecast(city)
      const hourlyData = await WeatherService.getHourlyForecast(city)

      setWeatherData(weather)
      setForecast(forecastData)
      setHourlyForecast(hourlyData)
      setSelectedCity(city)
      updateWeatherTheme(weather.weather[0].main)

      // Store weather data for offline access
      localStorage.setItem(
        "lastWeatherData",
        JSON.stringify({
          weather,
          forecast: forecastData,
          hourly: hourlyData,
          timestamp: Date.now(),
          city,
        }),
      )

      // Schedule notifications for weather events
      if (notificationsEnabled) {
        NotificationService.scheduleWeatherAlerts(forecastData, userName)
      }
    } catch (error) {
      console.error("Error loading weather data:", error)
      // Try to load from offline storage
      const offlineData = localStorage.getItem("lastWeatherData")
      if (offlineData) {
        const parsed = JSON.parse(offlineData)
        setWeatherData(parsed.weather)
        setForecast(parsed.forecast)
        setHourlyForecast(parsed.hourly || [])
      }
    }
    setLoading(false)
  }

  const loadWeatherDataByCoords = async (lat: number, lon: number, cityName: string) => {
    setLoading(true)
    try {
      const weather = await WeatherService.getCurrentWeatherByCoords(lat, lon)
      const forecastData = await WeatherService.getForecastByCoords(lat, lon)
      const hourlyData = await WeatherService.getHourlyForecastByCoords(lat, lon)

      setWeatherData(weather)
      setForecast(forecastData)
      setHourlyForecast(hourlyData)
      setSelectedCity(cityName)
      updateWeatherTheme(weather.weather[0].main)

      // Store weather data for offline access
      localStorage.setItem(
        "lastWeatherData",
        JSON.stringify({
          weather,
          forecast: forecastData,
          hourly: hourlyData,
          timestamp: Date.now(),
          city: cityName,
        }),
      )

      // Schedule notifications for weather events
      if (notificationsEnabled) {
        NotificationService.scheduleWeatherAlerts(forecastData, userName)
      }
    } catch (error) {
      console.error("Error loading weather data:", error)
      loadWeatherData("Nairobi")
    }
    setLoading(false)
  }

  const updateWeatherTheme = (weatherCondition: string) => {
    switch (weatherCondition.toLowerCase()) {
      case "clear":
        setWeatherTheme("sunny")
        break
      case "rain":
      case "drizzle":
        setWeatherTheme("rainy")
        break
      case "thunderstorm":
        setWeatherTheme("stormy")
        break
      case "clouds":
        setWeatherTheme("cloudy")
        break
      case "snow":
        setWeatherTheme("snowy")
        break
      default:
        setWeatherTheme("default")
    }
  }

  const getThemeClasses = () => {
    switch (weatherTheme) {
      case "sunny":
        return "from-yellow-300 via-orange-400 to-red-400"
      case "rainy":
        return "from-gray-600 via-blue-700 to-blue-900"
      case "stormy":
        return "from-gray-800 via-gray-900 to-black"
      case "cloudy":
        return "from-gray-400 via-gray-500 to-gray-600"
      case "snowy":
        return "from-blue-200 via-blue-300 to-blue-400"
      default:
        return "from-blue-400 via-blue-500 to-blue-600"
    }
  }

  const handleVoiceCommand = (command: string) => {
    const response = VoiceService.processCommand(command, weatherData, forecast, language)
    VoiceService.speak(response, voiceGender)
  }

  const toggleVoiceListening = () => {
    if (isListening) {
      VoiceService.stopListening()
    } else {
      VoiceService.startListening(handleVoiceCommand)
    }
    setIsListening(!isListening)
  }

  const enableNotifications = async () => {
    const enabled = await NotificationService.requestPermission()
    setNotificationsEnabled(enabled)
    if (enabled && weatherData) {
      NotificationService.scheduleWeatherAlerts(forecast, userName)
    }
  }

  if (isFirstTime) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} flex items-center justify-center p-4`}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/eltek-logo.jpg" alt="Eltek Logo" width={80} height={80} className="rounded-lg" />
            </div>
            <CardTitle className="text-2xl">Welcome to Eltek Weather!</CardTitle>
            <CardDescription>Get personalized weather updates and recommendations for Kenya</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("whatsYourName")}
              </label>
              <Input
                id="name"
                placeholder={t("enterYourName")}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && userName.trim() && handleFirstTimeSetup(userName.trim())}
              />
            </div>
            <Button
              onClick={() => handleFirstTimeSetup(userName.trim())}
              disabled={!userName.trim()}
              className="w-full"
            >
              {t("getStarted")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} relative transition-all duration-1000`}>
      {weatherData && (
        <>
          <WeatherAnimation weatherType={weatherData.weather[0].main} className="opacity-30" />
          <WeatherSounds weatherType={weatherData.weather[0].main} enabled={soundEnabled} />
        </>
      )}
      <div className="container mx-auto p-4 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Image src="/eltek-logo.jpg" alt="Eltek Weather" width={50} height={50} className="rounded-lg" />
            <div>
              <h1 className="text-3xl font-bold">
                {t("hello")}, {userName}! 👋
              </h1>
              <p className="text-blue-100">{t("stayPrepared")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white text-blue-600"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
              <SelectTrigger className="w-20 bg-white text-blue-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="sw">SW</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceListening}
              className={`${isListening ? "bg-red-500 text-white" : "bg-white text-blue-600"}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Select value={voiceGender} onValueChange={(value: "male" | "female") => setVoiceGender(value)}>
              <SelectTrigger className="w-24 bg-white text-blue-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">{t("female")}</SelectItem>
                <SelectItem value="male">{t("male")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location & City Selection */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {currentLocation && (
                <Button variant="outline" size="sm" onClick={requestLocation} className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {locationName || "Current Location"}
                </Button>
              )}
              <Select value={selectedCity} onValueChange={loadWeatherData}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {KENYA_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={enableNotifications} variant={notificationsEnabled ? "default" : "outline"} size="sm">
                <Bell className="h-4 w-4 mr-2" />
                {notificationsEnabled ? "Notifications On" : "Enable Notifications"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Commands Help */}
        <VoiceCommands isListening={isListening} t={t} />

        {loading ? (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>{t("loadingWeather")}</p>
          </div>
        ) : weatherData ? (
          <>
            {/* Current Weather */}
            <WeatherCard weather={weatherData} city={locationName || selectedCity} t={t} />

            {/* Hourly Forecast */}
            <HourlyForecast hourlyData={hourlyForecast} t={t} />

            {/* Recommendations */}
            <RecommendationCard weather={weatherData} userName={userName} t={t} />

            {/* 5-Day Forecast */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  {t("forecast")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {forecast.slice(0, 5).map((day, index) => (
                    <div key={index} className="text-center p-4 rounded-lg bg-blue-50">
                      <p className="font-medium text-sm">
                        {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <div className="my-2">
                        {day.weather[0].main === "Rain" ? (
                          <CloudRain className="h-8 w-8 mx-auto text-blue-600" />
                        ) : day.weather[0].main === "Clear" ? (
                          <Sun className="h-8 w-8 mx-auto text-yellow-500" />
                        ) : (
                          <Cloud className="h-8 w-8 mx-auto text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {Math.round(day.main.temp_max)}°/{Math.round(day.main.temp_min)}°
                      </p>
                      <p className="text-xs text-gray-600 capitalize">{day.weather[0].description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification Setup */}
            <NotificationSetup
              enabled={notificationsEnabled}
              onToggle={setNotificationsEnabled}
              userName={userName}
              t={t}
            />
          </>
        ) : (
          <Alert>
            <AlertDescription>{t("unableToLoad")}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
