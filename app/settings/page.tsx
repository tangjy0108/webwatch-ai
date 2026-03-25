"use client";
import { MessageSquare, Send, Check, Info, Bell, Newspaper, Briefcase, Database, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

type TestResult = "ok" | "fail" | null;

export default function SettingsPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resolvingChatId, setResolvingChatId] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [msgCount, setMsgCount] = useState(0);
  const [notifications, setNotifications] = useState({
    newsMorning: true,
    jobsEvening: true,
    newsWeekend: false,
    jobsWeekend: false,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setBotToken(data.settings.tg_bot_token || "");
          setChatId(data.settings.tg_chat_id || "");
          setIsVerified(Boolean(data.settings.tg_bot_token && data.settings.tg_chat_id));
          setNotifications({
            newsMorning: data.settings.notify_news ?? true,
            jobsEvening: data.settings.notify_jobs ?? true,
            newsWeekend: data.settings.news_weekend ?? data.settings.notify_weekends ?? false,
            jobsWeekend: data.settings.jobs_weekend ?? data.settings.notify_weekends ?? false,
          });
        }
        setDbConnected(data.dbConnected ?? false);
        setMsgCount(data.msgCount ?? 0);
      })
      .catch(() => setDbConnected(false));
  }, []);

  const verify = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/settings/verify-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken, chatId }),
      });
      setIsVerified(res.ok);
    } catch {
      setIsVerified(false);
    }
    setVerifying(false);
  };

  const resolveChatId = async () => {
    if (!botToken) return;
    setResolvingChatId(true);
    try {
      const res = await fetch("/api/settings/resolve-chat-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken }),
      });
      const data = await res.json();
      if (res.ok && data.chatId) setChatId(String(data.chatId));
    } catch {
      // Keep current UI state if resolve fails.
    }
    setResolvingChatId(false);
  };

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/test-notify", { method: "POST" });
      setTestResult(res.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    }
    setTesting(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tg_bot_token: botToken,
          tg_chat_id: chatId,
          notify_news: notifications.newsMorning,
          notify_jobs: notifications.jobsEvening,
          news_weekend: notifications.newsWeekend,
          jobs_weekend: notifications.jobsWeekend,
          notify_weekends: notifications.newsWeekend || notifications.jobsWeekend,
        }),
      });
      setIsVerified(Boolean(botToken && chatId));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">設定</h1>
          <p className="text-muted-foreground mt-1">Telegram Bot 設定與通知偏好</p>
        </div>
        <Button className="rounded-xl" onClick={save} disabled={saving}>{saving ? "儲存中…" : "儲存設定"}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Telegram Bot 設定</CardTitle>
            <CardDescription>連接你的 Telegram Bot，接收每日新聞摘要與職缺通知</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    <li>將 Token 和 Chat ID 填入下方並點「驗證」</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bot Token</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" value={botToken} onChange={e => setBotToken(e.target.value)} className="rounded-xl border-border bg-white" />
                <Button variant="outline" className={`rounded-xl whitespace-nowrap ${isVerified ? "border-[#059669] text-[#059669]" : ""}`} onClick={verify} disabled={!botToken || !chatId || verifying}>
                  {verifying ? "驗證中…" : isVerified ? <><Check className="w-4 h-4 mr-1" />已驗證</> : "驗證"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">來自 @BotFather 的 Bot Token</p>
            </div>

            <div className="space-y-2">
              <Label>Chat ID</Label>
              <div className="flex gap-2">
                <Input placeholder="123456789" value={chatId} onChange={e => setChatId(e.target.value)} className="rounded-xl border-border bg-white" />
                <Button variant="outline" className="rounded-xl whitespace-nowrap" onClick={resolveChatId} disabled={!botToken || resolvingChatId}>
                  {resolvingChatId ? "取得中…" : "自動取得"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">你的個人 Chat ID，用於接收推播訊息</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-3">
              <Button size="lg" className="rounded-xl" disabled={!botToken || !chatId || testing} onClick={sendTest}>
                <Send className="w-4 h-4 mr-2" />{testing ? "發送中…" : "發送測試訊息"}
              </Button>
              {testResult === "ok" && <span className="text-sm text-[#059669] flex items-center gap-1"><Check className="w-4 h-4" />訊息已發送</span>}
              {testResult === "fail" && <span className="text-sm text-[#DC2626] flex items-center gap-1"><AlertCircle className="w-4 h-4" />發送失敗，請確認設定</span>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isVerified ? "bg-[#D1FAE5]" : "bg-[#F0EFFF]"}`}>
                  <MessageSquare className={`w-6 h-6 ${isVerified ? "text-[#059669]" : "text-[#7C6FF7]"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bot 狀態</p>
                  <h3 className={`text-xl font-semibold ${isVerified ? "text-[#059669]" : "text-foreground"}`}>{isVerified ? "已連線" : "未設定"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{isVerified ? "Bot 驗證成功，可接收推播" : "請完成上方設定"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-[#60A5FA]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">本月推播次數</p>
                  <h3 className="text-2xl font-semibold text-foreground">{msgCount}</h3>
                  <p className="text-xs text-muted-foreground mt-1">新聞 + 職缺</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${dbConnected ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]"}`}>
                  <Database className={`w-6 h-6 ${dbConnected ? "text-[#059669]" : "text-[#DC2626]"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">資料庫</p>
                  <h3 className={`text-lg font-semibold ${dbConnected ? "text-[#059669]" : "text-[#DC2626]"}`}>{dbConnected === null ? "檢查中…" : dbConnected ? "已連線" : "未連線"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{dbConnected ? "Supabase 連線正常" : "請設定環境變數"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />通知偏好</CardTitle>
          <CardDescription>選擇要接收哪些推播</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "newsMorning" as const, icon: Newspaper, bg: "bg-[#F0EFFF]", color: "text-[#7C6FF7]", label: "每日早報", desc: "早上 8:00 新聞摘要" },
              { key: "jobsEvening" as const, icon: Briefcase, bg: "bg-[#D1FAE5]", color: "text-[#059669]", label: "職缺通知", desc: "依排程掃描 104 職缺變動" },
              { key: "newsWeekend" as const, icon: Newspaper, bg: "bg-[#FEF3C7]", color: "text-[#D97706]", label: "假日早報", desc: "週六、週日也執行新聞抓取" },
              { key: "jobsWeekend" as const, icon: Briefcase, bg: "bg-[#FEF3C7]", color: "text-[#D97706]", label: "假日職缺", desc: "週六、週日也掃描職缺" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch checked={notifications[item.key]} onCheckedChange={value => setNotifications(current => ({ ...current, [item.key]: value }))} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
