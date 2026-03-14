import { 
  Send, 
  MessageSquare,
  Bell,
  Check,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useState } from "react";

export function Schedule() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyBriefing: true,
    instantAlerts: false,
    summaryPreview: true,
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Telegram Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your Telegram bot for receiving daily briefings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telegram Configuration */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Telegram Bot Configuration
            </CardTitle>
            <CardDescription>
              Connect your Telegram bot to receive daily briefings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#60A5FA]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#60A5FA]/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">How to setup your Telegram bot</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Open Telegram and search for @BotFather</li>
                    <li>Send /newbot and follow the instructions</li>
                    <li>Copy your bot token and paste it below</li>
                    <li>Start a chat with your bot and send any message</li>
                    <li>Click "Get Chat ID" below to retrieve your Chat ID</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-token">Bot Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="bot-token"
                    type="password"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="rounded-xl border-border bg-white"
                  />
                  <Button 
                    variant="outline" 
                    className="rounded-xl whitespace-nowrap"
                    onClick={() => setIsVerified(true)}
                  >
                    {isVerified ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Verified
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your bot token from @BotFather
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat-id">Chat ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="chat-id"
                    placeholder="123456789"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="rounded-xl border-border bg-white"
                  />
                  <Button variant="outline" className="rounded-xl whitespace-nowrap">
                    Get Chat ID
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your personal chat ID for receiving messages
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  className="w-full sm:w-auto rounded-xl" 
                  size="lg"
                  disabled={!botToken || !chatId}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F0EFFF] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-[#7C6FF7]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bot Status</p>
                  <h3 className="text-xl font-semibold text-foreground">
                    {isVerified ? "Connected" : "Not Connected"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isVerified ? "Bot is ready" : "Setup required"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-[#34D399]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Messages Sent</p>
                  <h3 className="text-2xl font-semibold text-foreground">48</h3>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-gradient-to-br from-white to-[#F0EFFF]/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next Briefing</p>
                  <h3 className="text-xl font-semibold text-foreground">8:00 AM</h3>
                  <p className="text-xs text-muted-foreground mt-1">Tomorrow morning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification Preferences */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize what notifications you receive via Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Daily Briefing</h4>
              <p className="text-sm text-muted-foreground">
                Receive a morning summary of all monitored websites at 8:00 AM
              </p>
            </div>
            <Switch 
              checked={notificationSettings.dailyBriefing}
              onCheckedChange={(checked) => 
                setNotificationSettings({ ...notificationSettings, dailyBriefing: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Instant Alerts</h4>
              <p className="text-sm text-muted-foreground">
                Get notified immediately when important content is detected
              </p>
            </div>
            <Switch 
              checked={notificationSettings.instantAlerts}
              onCheckedChange={(checked) => 
                setNotificationSettings({ ...notificationSettings, instantAlerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Summary Preview</h4>
              <p className="text-sm text-muted-foreground">
                Include a short preview of each summary in the notification
              </p>
            </div>
            <Switch 
              checked={notificationSettings.summaryPreview}
              onCheckedChange={(checked) => 
                setNotificationSettings({ ...notificationSettings, summaryPreview: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}