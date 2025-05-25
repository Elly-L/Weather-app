import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Clock, AlertTriangle } from "lucide-react"

interface NotificationSetupProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  userName: string
  t: (key: string) => string
}

export function NotificationSetup({ enabled, onToggle, userName, t }: NotificationSetupProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("smartNotifications")}
        </CardTitle>
        <CardDescription>{t("notificationsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="notifications">{t("enableNotifications")}</Label>
            <p className="text-sm text-gray-600">{t("receiveAlerts")}</p>
          </div>
          <Switch id="notifications" checked={enabled} onCheckedChange={onToggle} />
        </div>

        {enabled && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">{t("youllReceive")}</h4>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>{t("rainAlerts")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{t("tempChanges")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-green-500" />
                <span>{t("severeWeather")}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t("offlineWork")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
