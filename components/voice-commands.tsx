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
    "Will it rain today?",
    "How hot is it?",
    "What should I wear?",
    "Is it going to be sunny?",
    "Do I need an umbrella?",
    "What's the temperature?",
    "How's the weather tomorrow?",
  ]

  if (!isListening) return null

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <Mic className="h-5 w-5 animate-pulse" />
          {t("listeningFor")}
        </CardTitle>
        <CardDescription className="text-red-600">{t("trySaying")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {commands.map((command, index) => (
            <Badge key={index} variant="outline" className="text-red-700 border-red-300">
              "{command}"
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
