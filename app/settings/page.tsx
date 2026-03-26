"use client";

import { MessageSquare, Send, Check, Info, Bell, Newspaper, Briefcase, Database, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

type TestResult = "ok" | "fail" | null;

interface SettingsResponse {
  settings?: {
    tg_chat_id?: string;
    notify_news?: boolean;
    notify_jobs?: boolean;
    notify_weekends?: boolean;
    news_weekend?: boolean;
    jobs_weekend?: boolean;
    news_ai_enabled?: boolean;
    news_ai_api_base_url?: string;
    news_ai_model?: string;
    news_ai_system_prompt?: string;
    news_ai_temperature?: number;
    news_ai_max_input_items?: number;
  } | null;
  dbConnected?: boolean;
  msgCount?: number;
  secrets?: {
    telegramBotTokenConfigured?: boolean;
    telegramChatIdConfigured?: boolean;
    geminiApiKeyConfigured?: boolean;
    effectiveNewsAiBaseUrl?: string;
    effectiveNewsAiModel?: string;
  };
}

export default function SettingsPage() {
  const [chatId, setChatId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resolvingChatId, setResolvingChatId] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [msgCount, setMsgCount] = useState(0);
  const [secretStatus, setSecretStatus] = useState({
    telegramBotTokenConfigured: false,
    telegramChatIdConfigured: false,
    geminiApiKeyConfigured: false,
    effectiveNewsAiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    effectiveNewsAiModel: "gemini-2.5-flash",
  });
  const [notifications, setNotifications] = useState({
    newsMorning: true,
    jobsEvening: true,
    newsWeekend: false,
    jobsWeekend: false,
  });
  const [aiSettings, setAiSettings] = useState({
    enabled: false,
    apiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
    systemPrompt: "",
    temperature: "0.2",
    maxInputItems: "8",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((data: SettingsResponse) => {
        if (data.settings) {
          setChatId(data.settings.tg_chat_id || "");
          setNotifications({
            newsMorning: data.settings.notify_news ?? true,
            jobsEvening: data.settings.notify_jobs ?? true,
            newsWeekend: data.settings.news_weekend ?? data.settings.notify_weekends ?? false,
            jobsWeekend: data.settings.jobs_weekend ?? data.settings.notify_weekends ?? false,
          });
          setAiSettings({
            enabled: data.settings.news_ai_enabled ?? false,
            apiBaseUrl: data.settings.news_ai_api_base_url ?? "https://generativelanguage.googleapis.com/v1beta/openai",
            model: data.settings.news_ai_model ?? "gemini-2.5-flash",
            systemPrompt: data.settings.news_ai_system_prompt ?? "",
            temperature: String(data.settings.news_ai_temperature ?? 0.2),
            maxInputItems: String(data.settings.news_ai_max_input_items ?? 8),
          });
        }

        if (data.secrets) {
          setSecretStatus({
            telegramBotTokenConfigured: data.secrets.telegramBotTokenConfigured ?? false,
            telegramChatIdConfigured: data.secrets.telegramChatIdConfigured ?? false,
            geminiApiKeyConfigured: data.secrets.geminiApiKeyConfigured ?? false,
            effectiveNewsAiBaseUrl: data.secrets.effectiveNewsAiBaseUrl ?? "https://generativelanguage.googleapis.com/v1beta/openai",
            effectiveNewsAiModel: data.secrets.effectiveNewsAiModel ?? "gemini-2.5-flash",
          });
          setIsVerified(Boolean(data.secrets.telegramBotTokenConfigured && data.secrets.telegramChatIdConfigured));
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
        body: JSON.stringify({ chatId }),
      });
      setIsVerified(res.ok);
    } catch {
      setIsVerified(false);
    }
    setVerifying(false);
  };

  const resolveChatId = async () => {
    setResolvingChatId(true);
    try {
      const res = await fetch("/api/settings/resolve-chat-id", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.chatId) {
        setChatId(String(data.chatId));
      }
    } catch {
      // Keep current UI state if resolve fails.
    }
    setResolvingChatId(false);
  };

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/test-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      setTestResult(res.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    }
    setTesting(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tg_chat_id: chatId,
          notify_news: notifications.newsMorning,
          notify_jobs: notifications.jobsEvening,
          news_weekend: notifications.newsWeekend,
          jobs_weekend: notifications.jobsWeekend,
          notify_weekends: notifications.newsWeekend || notifications.jobsWeekend,
          news_ai_enabled: aiSettings.enabled,
          news_ai_api_base_url: aiSettings.apiBaseUrl,
          news_ai_model: aiSettings.model,
          news_ai_system_prompt: aiSettings.systemPrompt,
          news_ai_temperature: Number(aiSettings.temperature),
          news_ai_max_input_items: Number(aiSettings.maxInputItems),
        }),
      });

      if (res.ok) {
        setIsVerified(Boolean(secretStatus.telegramBotTokenConfigured && chatId.trim()));
      }
    } finally {
      setSaving(false);
    }
  };

  const telegramReady = secretStatus.telegramBotTokenConfigured && Boolean(chatId.trim());

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">設定</h1>
          <p className="text-muted-foreground mt-1">把 secret 放在 Vercel，站內只保留可調整的通知與 AI digest 參數</p>
        </div>
        <Button className="rounded-xl" onClick={save} disabled={saving}>{saving ? "儲存中…" : "儲存設定"}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Telegram 設定</CardTitle>
            <CardDescription>Bot Token 改由 Vercel 環境變數提供，這裡只設定 Chat ID 與驗證通知路徑</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#60A5FA]/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#60A5FA]/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-[#60A5FA]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">部署方式</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>先在 Vercel 設定 `TELEGRAM_BOT_TOKEN`</li>
                    <li>到 Telegram 跟你的 Bot 對話，送一則訊息</li>
                    <li>回來按「自動取得」抓 Chat ID</li>
                    <li>儲存後再按「驗證」與「發送測試訊息」</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Vercel Secret 狀態</p>
                  <p className="text-xs text-muted-foreground">真正的 Bot Token 不再出現在設定頁</p>
                </div>
                <span className={`text-xs font-medium ${secretStatus.telegramBotTokenConfigured ? "text-[#059669]" : "text-[#DC2626]"}`}>
                  {secretStatus.telegramBotTokenConfigured ? "TELEGRAM_BOT_TOKEN 已設定" : "TELEGRAM_BOT_TOKEN 未設定"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chat ID</Label>
              <div className="flex gap-2">
                <Input placeholder="123456789" value={chatId} onChange={e => setChatId(e.target.value)} className="rounded-xl border-border bg-white" />
                <Button variant="outline" className="rounded-xl whitespace-nowrap" onClick={resolveChatId} disabled={!secretStatus.telegramBotTokenConfigured || resolvingChatId}>
                  {resolvingChatId ? "取得中…" : "自動取得"}
                </Button>
                <Button variant="outline" className={`rounded-xl whitespace-nowrap ${isVerified ? "border-[#059669] text-[#059669]" : ""}`} onClick={verify} disabled={!secretStatus.telegramBotTokenConfigured || !chatId || verifying}>
                  {verifying ? "驗證中…" : isVerified ? <><Check className="w-4 h-4 mr-1" />已驗證</> : "驗證"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">可存在設定頁，或另外用 `TELEGRAM_CHAT_ID` 放在 Vercel env 覆蓋</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-3">
              <Button size="lg" className="rounded-xl" disabled={!telegramReady || testing} onClick={sendTest}>
                <Send className="w-4 h-4 mr-2" />{testing ? "發送中…" : "發送測試訊息"}
              </Button>
              {testResult === "ok" && <span className="text-sm text-[#059669] flex items-center gap-1"><Check className="w-4 h-4" />訊息已發送</span>}
              {testResult === "fail" && <span className="text-sm text-[#DC2626] flex items-center gap-1"><AlertCircle className="w-4 h-4" />發送失敗，請確認 env 與 Chat ID</span>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${telegramReady ? "bg-[#D1FAE5]" : "bg-[#F0EFFF]"}`}>
                  <MessageSquare className={`w-6 h-6 ${telegramReady ? "text-[#059669]" : "text-[#7C6FF7]"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Telegram 狀態</p>
                  <h3 className={`text-xl font-semibold ${telegramReady ? "text-[#059669]" : "text-foreground"}`}>{telegramReady ? "可通知" : "未完成"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{telegramReady ? "Bot Token 與 Chat ID 已就緒" : "先補齊 env 或 Chat ID"}</p>
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
                  <p className="text-xs text-muted-foreground mt-1">{dbConnected ? "Supabase 連線正常" : "請先設定 Supabase env"}</p>
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

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Gemini Digest 設定</CardTitle>
          <CardDescription>Gemini API key 走 Vercel env，這裡只調整 digest 行為與模型參數</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">啟用 AI Digest</p>
              <p className="text-xs text-muted-foreground">新聞 runner 會在寫入 news_items 後呼叫 Gemini 產生免費版 digest</p>
            </div>
            <Switch checked={aiSettings.enabled} onCheckedChange={value => setAiSettings(current => ({ ...current, enabled: value }))} />
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Vercel Secret 狀態</p>
              <span className={`text-xs font-medium ${secretStatus.geminiApiKeyConfigured ? "text-[#059669]" : "text-[#DC2626]"}`}>
                {secretStatus.geminiApiKeyConfigured ? "GEMINI_API_KEY 已設定" : "GEMINI_API_KEY 未設定"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">目前生效值會優先讀取 Vercel env，其次才使用下方的站內設定。</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>目前生效 Base URL：{secretStatus.effectiveNewsAiBaseUrl}</p>
              <p>目前生效 Model：{secretStatus.effectiveNewsAiModel}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>API Base URL</Label>
              <Input
                placeholder="https://generativelanguage.googleapis.com/v1beta/openai"
                value={aiSettings.apiBaseUrl}
                onChange={e => setAiSettings(current => ({ ...current, apiBaseUrl: e.target.value }))}
                className="rounded-xl border-border bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                placeholder="gemini-2.5-flash"
                value={aiSettings.model}
                onChange={e => setAiSettings(current => ({ ...current, model: e.target.value }))}
                className="rounded-xl border-border bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={aiSettings.temperature}
                onChange={e => setAiSettings(current => ({ ...current, temperature: e.target.value }))}
                className="rounded-xl border-border bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>最多送進模型的新聞數</Label>
              <Input
                type="number"
                min="1"
                max="20"
                step="1"
                value={aiSettings.maxInputItems}
                onChange={e => setAiSettings(current => ({ ...current, maxInputItems: e.target.value }))}
                className="rounded-xl border-border bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>System Prompt</Label>
            <Textarea
              rows={12}
              value={aiSettings.systemPrompt}
              onChange={e => setAiSettings(current => ({ ...current, systemPrompt: e.target.value }))}
              className="rounded-xl border-border bg-white font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">Prompt 不敏感，適合留在站內反覆調整；真正的 API key 請留在 Vercel。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
