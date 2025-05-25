const NLP_API_KEY = "852810ef7dad4b2f80c6c2673d8ef3af"
const NLP_BASE_URL = "https://api.wit.ai/message"

export interface NLPIntent {
  intent: string
  entities: {
    datetime?: string
    location?: string
    weather_type?: string
    time_period?: string
  }
  confidence: number
}

export class NLPService {
  static async processQuery(query: string): Promise<NLPIntent> {
    try {
      const response = await fetch(`${NLP_BASE_URL}?v=20231201&q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${NLP_API_KEY}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("NLP processing failed")
      }

      const data = await response.json()
      return this.parseWitResponse(data, query)
    } catch (error) {
      console.error("NLP Error:", error)
      // Fallback to basic pattern matching
      return this.fallbackProcessing(query)
    }
  }

  private static parseWitResponse(data: any, originalQuery: string): NLPIntent {
    const intents = data.intents || []
    const entities = data.entities || {}

    // Extract main intent
    let intent = "weather_query"
    if (intents.length > 0) {
      intent = intents[0].name
    } else {
      // Determine intent from query patterns
      const query = originalQuery.toLowerCase()
      if (query.includes("rain") || query.includes("umbrella")) {
        intent = "rain_query"
      } else if (query.includes("temperature") || query.includes("hot") || query.includes("cold")) {
        intent = "temperature_query"
      } else if (query.includes("wear") || query.includes("clothing")) {
        intent = "clothing_query"
      } else if (query.includes("tomorrow") || query.includes("later") || query.includes("tonight")) {
        intent = "future_weather_query"
      }
    }

    // Extract entities
    const extractedEntities: any = {}

    // Time entities
    if (entities["wit$datetime:datetime"]) {
      extractedEntities.datetime = entities["wit$datetime:datetime"][0]?.value
    }

    // Location entities
    if (entities["wit$location:location"]) {
      extractedEntities.location = entities["wit$location:location"][0]?.value
    }

    // Weather type entities
    if (entities.weather_type) {
      extractedEntities.weather_type = entities.weather_type[0]?.value
    }

    // Time period extraction from query
    extractedEntities.time_period = this.extractTimePeriod(originalQuery)

    return {
      intent,
      entities: extractedEntities,
      confidence: intents[0]?.confidence || 0.8,
    }
  }

  private static fallbackProcessing(query: string): NLPIntent {
    const lowerQuery = query.toLowerCase()
    let intent = "weather_query"
    const entities: any = {}

    // Intent detection
    if (lowerQuery.includes("rain") || lowerQuery.includes("umbrella")) {
      intent = "rain_query"
    } else if (lowerQuery.includes("temperature") || lowerQuery.includes("hot") || lowerQuery.includes("cold")) {
      intent = "temperature_query"
    } else if (lowerQuery.includes("wear") || lowerQuery.includes("clothing")) {
      intent = "clothing_query"
    } else if (lowerQuery.includes("tomorrow") || lowerQuery.includes("later") || lowerQuery.includes("tonight")) {
      intent = "future_weather_query"
    }

    // Time extraction
    entities.time_period = this.extractTimePeriod(query)

    // Weather type extraction
    if (lowerQuery.includes("sunny") || lowerQuery.includes("sun")) {
      entities.weather_type = "clear"
    } else if (lowerQuery.includes("cloudy") || lowerQuery.includes("clouds")) {
      entities.weather_type = "clouds"
    } else if (lowerQuery.includes("rainy") || lowerQuery.includes("rain")) {
      entities.weather_type = "rain"
    }

    return {
      intent,
      entities,
      confidence: 0.7,
    }
  }

  private static extractTimePeriod(query: string): string {
    const lowerQuery = query.toLowerCase()

    // Specific time patterns
    const timePatterns = [
      { pattern: /(\d{1,2})\s*(am|pm)/i, type: "specific_time" },
      { pattern: /(\d{1,2}):(\d{2})\s*(am|pm)?/i, type: "specific_time" },
      { pattern: /in\s+(\d+)\s+hours?/i, type: "hours_from_now" },
      { pattern: /next\s+(\d+)\s+hours?/i, type: "hours_from_now" },
      { pattern: /tomorrow/i, type: "tomorrow" },
      { pattern: /tonight/i, type: "tonight" },
      { pattern: /this\s+evening/i, type: "evening" },
      { pattern: /this\s+afternoon/i, type: "afternoon" },
      { pattern: /this\s+morning/i, type: "morning" },
      { pattern: /later\s+today/i, type: "later_today" },
      { pattern: /now/i, type: "now" },
    ]

    for (const { pattern, type } of timePatterns) {
      const match = query.match(pattern)
      if (match) {
        return type
      }
    }

    return "now"
  }

  static extractSpecificTime(query: string): Date | null {
    const now = new Date()
    const lowerQuery = query.toLowerCase()

    // Extract specific time
    const timeMatch = query.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
    if (timeMatch) {
      let hours = Number.parseInt(timeMatch[1])
      const minutes = timeMatch[2] ? Number.parseInt(timeMatch[2]) : 0
      const ampm = timeMatch[3]?.toLowerCase()

      if (ampm === "pm" && hours !== 12) {
        hours += 12
      } else if (ampm === "am" && hours === 12) {
        hours = 0
      }

      const targetTime = new Date(now)
      targetTime.setHours(hours, minutes, 0, 0)

      // If the time has passed today, assume tomorrow
      if (targetTime < now) {
        targetTime.setDate(targetTime.getDate() + 1)
      }

      return targetTime
    }

    // Extract relative time
    const hoursMatch = query.match(/in\s+(\d+)\s+hours?/i)
    if (hoursMatch) {
      const hoursFromNow = Number.parseInt(hoursMatch[1])
      const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000)
      return targetTime
    }

    // Handle named time periods
    if (lowerQuery.includes("tomorrow")) {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0) // Default to 9 AM tomorrow
      return tomorrow
    }

    if (lowerQuery.includes("tonight")) {
      const tonight = new Date(now)
      tonight.setHours(20, 0, 0, 0) // 8 PM tonight
      return tonight
    }

    if (lowerQuery.includes("evening")) {
      const evening = new Date(now)
      evening.setHours(18, 0, 0, 0) // 6 PM today
      return evening
    }

    if (lowerQuery.includes("afternoon")) {
      const afternoon = new Date(now)
      afternoon.setHours(14, 0, 0, 0) // 2 PM today
      return afternoon
    }

    return null
  }
}
