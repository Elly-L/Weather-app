import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic } from "lucide-react"

interface VoiceCommandsProps {
  isListening: boolean
  t: (key: string) => string
}

export function VoiceCommands({ isListening, t }: VoiceCommandsProps) {
  const commands = [
    "What's the weather like?",
    "Will it rain at 3 PM?",
    "How hot will it be tomorrow?",
    "What should I wear at 6 PM?",
    "Is it going to be sunny later?",
    "Do I need an umbrella tonight?",
    "What's the temperature in 2 hours?",
    "How's the weather at 10 AM tomorrow?",
    "Will it rain this evening?",
    "What's the weather like at noon?",
  ]

  if (!isListening) return null

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <Mic className="h-5 w-5 animate-pulse" />
          {t("listeningFor")} - Advanced NLP Enabled
        </CardTitle>
        <CardDescription className="text-red-600">{t("trySaying")} (Now with time-specific queries!)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {commands.map((command, index) => (
            <Badge key={index} variant="outline" className="text-red-700 border-red-300">
              "{command}"
            </Badge>
          ))}
        </div>
        <p className="text-xs text-red-600 mt-3">
          💡 Try asking about specific times like "3 PM", "tomorrow morning", "in 2 hours", etc.
        </p>
      </CardContent>
    </Card>
  )
}
