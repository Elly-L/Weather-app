import { getTranslation, type Language } from "./translations"
import { NLPService } from "./nlp-service"

export class VoiceService {
  private static recognition: any = null
  private static synthesis: SpeechSynthesis | null = null
  private static isListening = false

  static init() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = "en-US"
    }

    if ("speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  static startListening(callback: (command: string) => void) {
    if (!this.recognition) {
      this.init()
    }

    if (this.recognition && !this.isListening) {
      this.isListening = true

      this.recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase()
        callback(command)
      }

      this.recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        this.isListening = false
      }

      this.recognition.onend = () => {
        this.isListening = false
      }

      this.recognition.start()
    }
  }

  static stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  static async processCommand(
    command: string,
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    language = "en",
  ): Promise<string> {
    const t = (key: string) => getTranslation(key as any, language as Language)

    try {
      // Use NLP to process the command
      const nlpResult = await NLPService.processQuery(command)
      console.log("NLP Result:", nlpResult)

      // Extract specific time if mentioned
      const specificTime = NLPService.extractSpecificTime(command)

      // Handle all types of queries
      return this.generateResponse(command, nlpResult, specificTime, weatherData, forecast, hourlyForecast, t)
    } catch (error) {
      console.error("Error processing voice command:", error)
      return this.fallbackProcessCommand(command, weatherData, forecast, hourlyForecast, language)
    }
  }

  private static generateResponse(
    originalCommand: string,
    nlpResult: any,
    specificTime: Date | null,
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    t: (key: string) => string,
  ): string {
    const lowerCommand = originalCommand.toLowerCase()

    // Handle specific time queries
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        return this.generateTimeSpecificResponse(lowerCommand, hourlyData, specificTime, t)
      }
    }

    // Handle rain queries
    if (this.isRainQuery(lowerCommand)) {
      return this.handleRainQuery(weatherData, forecast, hourlyForecast, specificTime, t)
    }

    // Handle temperature queries
    if (this.isTemperatureQuery(lowerCommand)) {
      return this.handleTemperatureQuery(weatherData, forecast, hourlyForecast, specificTime, t)
    }

    // Handle clothing queries
    if (this.isClothingQuery(lowerCommand)) {
      return this.handleClothingQuery(weatherData, forecast, hourlyForecast, specificTime, t)
    }

    // Handle future weather queries
    if (this.isFutureWeatherQuery(lowerCommand)) {
      return this.handleFutureWeatherQuery(forecast, hourlyForecast, specificTime, lowerCommand, t)
    }

    // Handle sunny/clear weather queries
    if (this.isSunnyQuery(lowerCommand)) {
      return this.handleSunnyQuery(weatherData, forecast, hourlyForecast, specificTime, t)
    }

    // Handle wind queries
    if (this.isWindQuery(lowerCommand)) {
      return this.handleWindQuery(weatherData, forecast, hourlyForecast, specificTime, t)
    }

    // Handle humidity queries
    if (this.isHumidityQuery(lowerCommand)) {
      return this.handleHumidityQuery(weatherData, forecast, hourlyForecast, specificTime, t)
    }

    // Handle general weather queries
    if (this.isGeneralWeatherQuery(lowerCommand)) {
      return this.handleGeneralWeatherQuery(weatherData, forecast, hourlyForecast, specificTime, t)
    }

    // Default response for unrecognized commands
    return this.generateHelpfulResponse(lowerCommand, weatherData, t)
  }

  private static generateTimeSpecificResponse(
    command: string,
    hourlyData: any,
    targetTime: Date,
    t: (key: string) => string,
  ): string {
    const temp = Math.round(hourlyData.main.temp)
    const description = hourlyData.weather[0].description
    const timeStr = targetTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    const isRaining = hourlyData.weather[0].main === "Rain"
    const rainChance = hourlyData.pop ? Math.round(hourlyData.pop * 100) : 0

    if (command.includes("rain") || command.includes("umbrella")) {
      if (isRaining || rainChance > 30) {
        return `Yes, there's a ${rainChance}% chance of rain at ${timeStr}. I recommend carrying an umbrella!`
      } else {
        return `No rain expected at ${timeStr}. You can leave the umbrella at home!`
      }
    }

    if (command.includes("temperature") || command.includes("hot") || command.includes("cold")) {
      return `At ${timeStr}, the temperature will be ${temp} degrees Celsius with ${description}.`
    }

    if (command.includes("wear") || command.includes("clothing")) {
      let recommendation = `For ${timeStr}, `
      if (temp > 30) {
        recommendation += "it will be hot! Wear light, breathable clothing and don't forget sunscreen."
      } else if (temp < 15) {
        recommendation += "it will be cold! Layer up with warm clothing like a jacket or sweater."
      } else {
        recommendation += "the weather will be comfortable. Light clothing should be perfect."
      }

      if (isRaining || rainChance > 30) {
        recommendation += " Also, don't forget rain protection!"
      }

      return recommendation
    }

    return `At ${timeStr}, it will be ${temp} degrees with ${description}. ${
      rainChance > 30 ? `There's a ${rainChance}% chance of rain.` : ""
    }`
  }

  private static isRainQuery(command: string): boolean {
    return (
      command.includes("rain") || command.includes("umbrella") || command.includes("wet") || command.includes("shower")
    )
  }

  private static isTemperatureQuery(command: string): boolean {
    return (
      command.includes("temperature") ||
      command.includes("hot") ||
      command.includes("cold") ||
      command.includes("warm") ||
      command.includes("cool") ||
      command.includes("degree")
    )
  }

  private static isClothingQuery(command: string): boolean {
    return (
      command.includes("wear") ||
      command.includes("clothing") ||
      command.includes("dress") ||
      command.includes("outfit") ||
      command.includes("clothes")
    )
  }

  private static isFutureWeatherQuery(command: string): boolean {
    return (
      command.includes("tomorrow") ||
      command.includes("later") ||
      command.includes("tonight") ||
      command.includes("evening") ||
      command.includes("morning") ||
      command.includes("afternoon") ||
      command.includes("next")
    )
  }

  private static isSunnyQuery(command: string): boolean {
    return (
      command.includes("sunny") || command.includes("sun") || command.includes("clear") || command.includes("bright")
    )
  }

  private static isWindQuery(command: string): boolean {
    return command.includes("wind") || command.includes("windy") || command.includes("breeze")
  }

  private static isHumidityQuery(command: string): boolean {
    return (
      command.includes("humidity") ||
      command.includes("humid") ||
      command.includes("muggy") ||
      command.includes("sticky")
    )
  }

  private static isGeneralWeatherQuery(command: string): boolean {
    return (
      command.includes("weather") ||
      command.includes("forecast") ||
      command.includes("conditions") ||
      command.includes("outside") ||
      command.includes("today")
    )
  }

  private static handleRainQuery(
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    t: (key: string) => string,
  ): string {
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        const willRain = hourlyData.weather[0].main === "Rain" || hourlyData.pop > 0.3
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        const rainChance = hourlyData.pop ? Math.round(hourlyData.pop * 100) : 0
        return willRain
          ? `Yes, there's a ${rainChance}% chance of rain around ${timeStr}. Don't forget your umbrella!`
          : `No rain expected around ${timeStr}. You can leave the umbrella at home!`
      }
    }

    if (weatherData) {
      const isRaining = weatherData.weather[0].main === "Rain"
      const willRain = forecast.some((day) => day.weather[0].main === "Rain")

      if (isRaining) {
        return "Yes, it's currently raining. You should definitely carry an umbrella!"
      } else if (willRain) {
        return "Rain is expected in the forecast. I recommend carrying an umbrella just in case."
      } else {
        return "No rain is expected today. You can leave the umbrella at home!"
      }
    }
    return "I don't have rain information available right now."
  }

  private static handleTemperatureQuery(
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    t: (key: string) => string,
  ): string {
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        const temp = Math.round(hourlyData.main.temp)
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        return `The temperature around ${timeStr} will be ${temp} degrees Celsius with ${hourlyData.weather[0].description}.`
      }
    }

    if (weatherData) {
      const temp = Math.round(weatherData.main.temp)
      const description = weatherData.weather[0].description
      return `The current temperature is ${temp} degrees Celsius with ${description}.`
    }
    return "I don't have current weather data available."
  }

  private static handleClothingQuery(
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    t: (key: string) => string,
  ): string {
    let targetWeather = weatherData

    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        targetWeather = hourlyData
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        const temp = targetWeather.main.temp
        const isRaining = targetWeather.weather[0].main === "Rain"

        let recommendation = `For ${timeStr}, `
        if (temp > 30) {
          recommendation += "it will be hot! Wear light, breathable clothing and don't forget sunscreen."
        } else if (temp < 15) {
          recommendation += "it will be cold! Layer up with warm clothing like a jacket or sweater."
        } else {
          recommendation += "the weather will be comfortable. Light clothing should be perfect."
        }

        if (isRaining || targetWeather.pop > 0.3) {
          recommendation += " Also, don't forget rain protection!"
        }

        return recommendation
      }
    }

    if (targetWeather) {
      const temp = targetWeather.main.temp
      const isRaining = targetWeather.weather[0].main === "Rain"

      let recommendation = ""
      if (temp > 30) {
        recommendation = "It's hot! Wear light, breathable clothing and don't forget sunscreen."
      } else if (temp < 15) {
        recommendation = "It's cold! Layer up with warm clothing like a jacket or sweater."
      } else {
        recommendation = "The weather is comfortable. Light clothing should be perfect."
      }

      if (isRaining) {
        recommendation += " Also, don't forget rain protection!"
      }

      return recommendation
    }
    return "I don't have weather information to make clothing recommendations."
  }

  private static handleFutureWeatherQuery(
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    command: string,
    t: (key: string) => string,
  ): string {
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        const temp = Math.round(hourlyData.main.temp)
        const description = hourlyData.weather[0].description
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        return `At ${timeStr}, the weather will be ${temp} degrees with ${description}.`
      }
    }

    if (command.includes("tomorrow") && forecast.length > 1) {
      const tomorrow = forecast[1]
      const temp = Math.round(tomorrow.main.temp)
      const description = tomorrow.weather[0].description
      return `Tomorrow's weather will be ${temp} degrees Celsius with ${description}.`
    }

    return "I don't have forecast data available for that time."
  }

  private static handleSunnyQuery(
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    t: (key: string) => string,
  ): string {
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        const isSunny = hourlyData.weather[0].main === "Clear"
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        return isSunny
          ? `Yes, it will be sunny at ${timeStr}! Perfect weather to be outside.`
          : `It won't be particularly sunny at ${timeStr}. The weather will be ${hourlyData.weather[0].description}.`
      }
    }

    if (weatherData) {
      const isSunny = weatherData.weather[0].main === "Clear"
      return isSunny ? "Yes, it's sunny today! Perfect weather to be outside." : "It's not particularly sunny today."
    }
    return "I don't have sunshine information available."
  }

  private static handleWindQuery(
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    t: (key: string) => string,
  ): string {
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        const windSpeed = Math.round(hourlyData.wind.speed * 3.6)
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        return `Wind speed at ${timeStr} will be ${windSpeed} kilometers per hour.`
      }
    }

    if (weatherData) {
      const windSpeed = Math.round(weatherData.wind.speed * 3.6)
      return `Current wind speed is ${windSpeed} kilometers per hour.`
    }
    return "I don't have wind information available."
  }

  private static handleHumidityQuery(
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    t: (key: string) => string,
  ): string {
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        const humidity = hourlyData.main.humidity
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        return `Humidity at ${timeStr} will be ${humidity}%.`
      }
    }

    if (weatherData) {
      const humidity = weatherData.main.humidity
      return `Current humidity is ${humidity}%.`
    }
    return "I don't have humidity information available."
  }

  private static handleGeneralWeatherQuery(
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    specificTime: Date | null,
    t: (key: string) => string,
  ): string {
    if (specificTime) {
      const hourlyData = this.findHourlyDataForTime(hourlyForecast, specificTime)
      if (hourlyData) {
        const temp = Math.round(hourlyData.main.temp)
        const description = hourlyData.weather[0].description
        const timeStr = specificTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        return `At ${timeStr}, it will be ${temp} degrees with ${description}.`
      }
    }

    if (weatherData) {
      const temp = Math.round(weatherData.main.temp)
      const description = weatherData.weather[0].description
      return `The current temperature is ${temp} degrees Celsius with ${description}.`
    }
    return "I don't have current weather data available."
  }

  private static generateHelpfulResponse(command: string, weatherData: any, t: (key: string) => string): string {
    if (weatherData) {
      const temp = Math.round(weatherData.main.temp)
      const description = weatherData.weather[0].description
      return `I'm not sure about that specific query, but I can tell you the current weather is ${temp} degrees with ${description}. Try asking about rain, temperature, clothing, or future weather!`
    }
    return "I didn't understand that command. Try asking about the weather, rain, temperature, what to wear, or future forecasts!"
  }

  private static findHourlyDataForTime(hourlyForecast: any[], targetTime: Date): any | null {
    const targetHour = targetTime.getHours()
    const targetDate = targetTime.toDateString()

    for (const hourData of hourlyForecast) {
      const hourDate = new Date(hourData.dt * 1000)
      if (hourDate.toDateString() === targetDate && hourDate.getHours() === targetHour) {
        return hourData
      }
    }

    // If exact match not found, find closest hour
    let closestHour = null
    let minDiff = Number.POSITIVE_INFINITY

    for (const hourData of hourlyForecast) {
      const hourDate = new Date(hourData.dt * 1000)
      const diff = Math.abs(hourDate.getTime() - targetTime.getTime())
      if (diff < minDiff) {
        minDiff = diff
        closestHour = hourData
      }
    }

    return closestHour
  }

  private static fallbackProcessCommand(
    command: string,
    weatherData: any,
    forecast: any[],
    hourlyForecast: any[],
    language = "en",
  ): string {
    const lowerCommand = command.toLowerCase()
    const t = (key: string) => getTranslation(key as any, language as Language)

    // Basic pattern matching fallback
    if (lowerCommand.includes("weather") || lowerCommand.includes("temperature")) {
      if (weatherData) {
        const temp = Math.round(weatherData.main.temp)
        const description = weatherData.weather[0].description
        return `The current temperature is ${temp} degrees Celsius with ${description}.`
      }
      return "I don't have current weather data available."
    }

    if (lowerCommand.includes("rain") || lowerCommand.includes("umbrella")) {
      if (weatherData) {
        const isRaining = weatherData.weather[0].main === "Rain"
        return isRaining
          ? "Yes, it's currently raining. You should carry an umbrella!"
          : "No rain right now, but check the forecast for later!"
      }
      return "I don't have rain information available."
    }

    return "I didn't understand that command. Try asking about the weather, rain, temperature, or what to wear!"
  }

  static speak(text: string, gender: "male" | "female" = "female") {
    if (!this.synthesis) {
      this.init()
    }

    if (this.synthesis) {
      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Try to find appropriate voice
      const voices = this.synthesis.getVoices()
      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            (gender === "female"
              ? voice.name.toLowerCase().includes("female") || voice.name.toLowerCase().includes("woman")
              : voice.name.toLowerCase().includes("male") || voice.name.toLowerCase().includes("man")),
        ) || voices.find((voice) => voice.lang.startsWith("en"))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 0.9
      utterance.pitch = gender === "female" ? 1.1 : 0.9
      utterance.volume = 0.8

      this.synthesis.speak(utterance)
    }
  }
}
