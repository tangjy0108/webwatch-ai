"use client";
import {
  Newspaper, Briefcase, Send, Clock, CheckCircle2,
  RefreshCw, MessageSquare, Sparkles, XCircle, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface NotificationLog {
  id: number;
  type: "news" | "jobs";
  payload: string;
  sent_at: string;
  status: "sent" | "failed";
}

interface DashboardStats {
  newsToday: number;
  notificationsToday: number;
  newJobsToday: number;
  lastRun: string | null;
  systemOk: boolean;
  tgConnected: boolean;
}

const systemStatus = [
  { label: "新聞抓取", key: "newsToday" },
  { label: "職缺掃描", key: "jobsToday" },
  { label: "Telegram Bot", key: "tgConnected" },
  { label: "資料庫連線", key: "dbOk" },
];

export default function Dashboard() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    newsToday: 0, notificationsToday: 0, newJobsToday: 0,
    lastRun: null, systemOk: true, tgConnected: false,
  });
  const [running, setRunning] = useState<"news" | "jobs" | "test" | null>(null);
  const [statusMap, setStatusMap] = useState({ newsToday: true, jobsToday: true, tgConnected: false, dbOk: true });

  const today = new Date().toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "short" });

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      setLogs(d.logs || []);
      setStats(d.stats || stats);
      setStatusMap({
        newsToday: true,
        jobsToday: true,
        tgConnected: d.stats?.tgConnected || false,
        dbOk: true,
      });
    }).catch(() => {});
  }, []);

  const trigger = async (type: "news" | "jobs" | "test") => {
    setRunning(type);
    try {
      const url = type === "test" ? "/api/test-notify" : `/api/${type}/run`;
      await fetch(url, { method: "POST" });
      // Refresh logs
      const d = await fetch("/api/dashboard").then(r => r.json());
      setLogs(d.logs || []);
      setStats(d.stats || stats);
    } catch {}
    setRunning(null);
  };

  const statCards = [
    { title: "今日新聞", value: String(stats.newsToday), sub: "則已抓取", icon: Newspaper, color: "text-[#7C6FF7]", bgColor: "bg-[#F0EFFF]" },
    { title: "今日推播", value: String(stats.notificationsToday), sub: "次已發送", icon: Send, color: "text-[#60A5FA]", bgColor: "bg-[#EFF6FF]" },
    { title: "新增職缺", value: String(stats.newJobsToday), sub: "筆符合條件", icon: Briefcase, color: "text-[#34D399]", bgColor: "bg-[#D1FAE5]" },
    { title: "最後執行", value: stats.lastRun ? new Date(stats.lastRun).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }) : "--:--", sub: stats.lastRun ? "今天" : "尚未執行", icon: Clock, color: "text-[#FBBF24]", bgColor: "bg-[#FEF3C7]" },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">早安 ☀️</h1>
        <p className="text-muted-foreground">{today}・今日情報摘要</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-semibold text-foreground">{stat.value}</h3>
                <span className="text-xs text-muted-foreground">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Logs */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              最近推播記錄
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">尚無推播記錄</p>
            ) : logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${log.type === "news" ? "bg-[#F0EFFF]" : "bg-[#D1FAE5]"}`}>
                  {log.type === "news" ? <Newspaper className="w-4 h-4 text-[#7C6FF7]" /> : <Briefcase className="w-4 h-4 text-[#34D399]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-medium text-foreground">{log.type === "news" ? "今日早報" : "職缺通知"}</h4>
                    <Badge className={`text-xs px-1.5 py-0 ${log.status === "sent" ? "bg-[#D1FAE5] text-[#059669] border-[#059669]/20" : "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20"}`}>
                      {log.status === "sent" ? "已發送" : "失敗"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{log.payload}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-foreground">
                    {new Date(log.sent_at).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.sent_at).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                系統狀態
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "新聞抓取", ok: statusMap.newsToday },
                { label: "職缺掃描", ok: statusMap.jobsToday },
                { label: "Telegram Bot", ok: statusMap.tgConnected },
                { label: "資料庫連線", ok: statusMap.dbOk },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  {s.ok ? (
                    <div className="flex items-center gap-1.5 text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" /><span className="text-xs font-medium">正常</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#DC2626]">
                      <XCircle className="w-4 h-4" /><span className="text-xs font-medium">未連線</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-primary" />
                下次執行
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0EFFF] border border-[#7C6FF7]/10">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#7C6FF7]" />
                  <span className="text-sm font-medium text-foreground">新聞摘要</span>
                </div>
                <span className="text-sm font-semibold text-[#7C6FF7]">08:00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#D1FAE5] border border-[#34D399]/20">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#059669]" />
                  <span className="text-sm font-medium text-foreground">職缺掃描</span>
                </div>
                <span className="text-sm font-semibold text-[#059669]">17:00</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-border shadow-sm bg-gradient-to-br from-white to-[#F0EFFF]/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">手動執行</h3>
                <p className="text-sm text-muted-foreground">立即觸發抓取或推送，不等待排程</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => trigger("news")} disabled={running !== null}>
                <RefreshCw className={`w-4 h-4 mr-2 ${running === "news" ? "animate-spin" : ""}`} />
                {running === "news" ? "執行中…" : "執行新聞摘要"}
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => trigger("jobs")} disabled={running !== null}>
                <RefreshCw className={`w-4 h-4 mr-2 ${running === "jobs" ? "animate-spin" : ""}`} />
                {running === "jobs" ? "執行中…" : "掃描職缺"}
              </Button>
              <Button className="rounded-xl shadow-sm hover:shadow-md transition-shadow" onClick={() => trigger("test")} disabled={running !== null}>
                <Send className="w-4 h-4 mr-2" />
                {running === "test" ? "發送中…" : "發送測試訊息"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
