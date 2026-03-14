import {
  MessageSquare,
  Send,
  Check,
  Info,
  Bell,
  Newspaper,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useState } from "react";

export function Settings() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [notifications, setNotifications] = useState({
    newsMorning: true,
    jobsEvening: true,
    jobsWeekend: false,
    newsWeekend: false,
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">設定</h1>
        <p className="text-muted-foreground mt-1">
          Telegram Bot 設定與通知偏好
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telegram Config */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Telegram Bot 設定
            </CardTitle>
            <CardDescription>
              連接你的 Telegram Bot，接收每日新聞摘要與職缺通知
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Setup guide */}
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#60A5FA]/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#60A5FA]/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-[#60A5FA]" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">如何建立 Telegram Bot</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>在 Telegram 搜尋 <span className="font-mono bg-white/60 px-1 rounded">@BotFather</span></li>
                    <li>傳送 <span className="font-mono bg-white/60 px-1 rounded">/newbot</span>，依指示取得 Bot Token</li>
                    <li>開啟與你的 Bot 的對話，傳送任意訊息</li>
                    <li>將 Token 和 Chat ID 填入下方</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Bot Token */}
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
                  className={`rounded-xl whitespace-nowrap ${isVerified ? "border-[#059669] text-[#059669]" : ""}`}
                  onClick={() => setIsVerified(true)}
                  disabled={!botToken}
                >
                  {isVerified ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      已驗證
                    </>
                  ) : "驗證"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">來自 @BotFather 的 Bot Token</p>
            </div>

            {/* Chat ID */}
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
                  自動取得
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                你的個人 Chat ID，用於接收推播訊息
              </p>
            </div>

            {/* Test */}
            <div className="pt-2 border-t border-border">
              <Button
                size="lg"
                className="rounded-xl"
                disabled={!botToken || !chatId}
              >
                <Send className="w-4 h-4 mr-2" />
                發送測試訊息
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                確認 Bot 設定正確後，可發送一則測試訊息到你的 Telegram
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Bot Status */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isVerified ? "bg-[#D1FAE5]" : "bg-[#F0EFFF]"
                }`}>
                  <MessageSquare className={`w-6 h-6 ${isVerified ? "text-[#059669]" : "text-[#7C6FF7]"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bot 狀態</p>
                  <h3 className={`text-xl font-semibold ${isVerified ? "text-[#059669]" : "text-foreground"}`}>
                    {isVerified ? "已連線" : "未設定"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isVerified ? "Bot 運作正常，可接收推播" : "請完成上方設定"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages sent */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-[#60A5FA]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">本月推播次數</p>
                  <h3 className="text-2xl font-semibold text-foreground">48</h3>
                  <p className="text-xs text-muted-foreground mt-1">新聞 24 + 職缺 24</p>
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
            通知偏好
          </CardTitle>
          <CardDescription>
            選擇要接收哪些推播
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F0EFFF] flex items-center justify-center">
                  <Newspaper className="w-4 h-4 text-[#7C6FF7]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">每日早報</p>
                  <p className="text-xs text-muted-foreground">早上 8:00 新聞摘要</p>
                </div>
              </div>
              <Switch
                checked={notifications.newsMorning}
                onCheckedChange={(v) => setNotifications({ ...notifications, newsMorning: v })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-[#059669]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">職缺通知</p>
                  <p className="text-xs text-muted-foreground">下午 5:00 職缺更新</p>
                </div>
              </div>
              <Switch
                checked={notifications.jobsEvening}
                onCheckedChange={(v) => setNotifications({ ...notifications, jobsEvening: v })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                  <Newspaper className="w-4 h-4 text-[#D97706]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">假日早報</p>
                  <p className="text-xs text-muted-foreground">週六、週日也推送新聞</p>
                </div>
              </div>
              <Switch
                checked={notifications.newsWeekend}
                onCheckedChange={(v) => setNotifications({ ...notifications, newsWeekend: v })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-[#D97706]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">假日職缺</p>
                  <p className="text-xs text-muted-foreground">週六、週日也掃描職缺</p>
                </div>
              </div>
              <Switch
                checked={notifications.jobsWeekend}
                onCheckedChange={(v) => setNotifications({ ...notifications, jobsWeekend: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
