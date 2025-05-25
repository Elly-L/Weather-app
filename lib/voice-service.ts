import { getTranslation, type Language } from "./translations"

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

  static processCommand(command: string, weatherData: any, forecast: any[], language = "en"): string {
    const lowerCommand = command.toLowerCase()
    const t = (key: string) => getTranslation(key as any, language as Language)

    if (
      lowerCommand.includes("weather") ||
      lowerCommand.includes("temperature") ||
      lowerCommand.includes("hot") ||
      lowerCommand.includes("cold")
    ) {
      if (weatherData) {
        const temp = Math.round(weatherData.main.temp)
        const description = weatherData.weather[0].description
        return `${t("currentTemp")} ${temp} ${t("degreesCelsius")} ${description}.`
      }
      return t("noWeatherData")
    }

    if (lowerCommand.includes("rain") || lowerCommand.includes("umbrella")) {
      if (weatherData) {
        const isRaining = weatherData.weather[0].main === "Rain"
        const willRain = forecast.some((day) => day.weather[0].main === "Rain")

        if (isRaining) {
          return t("isRaining")
        } else if (willRain) {
          return t("willRain")
        } else {
          return t("noRainExpected")
        }
      }
      return t("noRainData")
    }

    if (lowerCommand.includes("wear") || lowerCommand.includes("clothing") || lowerCommand.includes("dress")) {
      if (weatherData) {
        const temp = weatherData.main.temp
        const isRaining = weatherData.weather[0].main === "Rain"

        let recommendation = ""
        if (temp > 30) {
          recommendation = t("hotWeather")
        } else if (temp < 15) {
          recommendation = t("coldWeather")
        } else {
          recommendation = t("comfortableWeather")
        }

        if (isRaining) {
          recommendation += " " + t("rainProtection")
        }

        return recommendation
      }
      return t("noClothingData")
    }

    if (lowerCommand.includes("sunny") || lowerCommand.includes("sun")) {
      if (weatherData) {
        const isSunny = weatherData.weather[0].main === "Clear"
        return isSunny ? t("isSunny") : t("notSunny")
      }
      return t("noSunshineData")
    }

    if (lowerCommand.includes("tomorrow")) {
      if (forecast && forecast.length > 1) {
        const tomorrow = forecast[1]
        const temp = Math.round(tomorrow.main.temp)
        const description = tomorrow.weather[0].description
        return `${t("tomorrowWeather")} ${temp} ${t("degreesCelsius")} ${description}.`
      }
      return t("noForecastData")
    }

    return t("commandNotRecognized")
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
