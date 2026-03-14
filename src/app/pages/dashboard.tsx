import {
  Newspaper,
  Briefcase,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const stats = [
  {
    title: "今日新聞",
    value: "14",
    sub: "則已抓取",
    icon: Newspaper,
    color: "text-[#7C6FF7]",
    bgColor: "bg-[#F0EFFF]",
  },
  {
    title: "今日推播",
    value: "2",
    sub: "次已發送",
    icon: Send,
    color: "text-[#60A5FA]",
    bgColor: "bg-[#EFF6FF]",
  },
  {
    title: "新增職缺",
    value: "6",
    sub: "筆符合條件",
    icon: Briefcase,
    color: "text-[#34D399]",
    bgColor: "bg-[#D1FAE5]",
  },
  {
    title: "最後執行",
    value: "17:01",
    sub: "今天下午",
    icon: Clock,
    color: "text-[#FBBF24]",
    bgColor: "bg-[#FEF3C7]",
  },
];

const recentNotifications = [
  {
    id: 1,
    type: "jobs",
    title: "職缺通知",
    desc: "新增 6 筆職缺・下架 2 筆",
    time: "17:01",
    date: "今天",
    status: "sent",
  },
  {
    id: 2,
    type: "news",
    title: "今日早報",
    desc: "14 則新聞摘要・3 個主題分類",
    time: "08:03",
    date: "今天",
    status: "sent",
  },
  {
    id: 3,
    type: "jobs",
    title: "職缺通知",
    desc: "新增 3 筆職缺・無下架",
    time: "17:00",
    date: "昨天",
    status: "sent",
  },
  {
    id: 4,
    type: "news",
    title: "今日早報",
    desc: "9 則新聞摘要・2 個主題分類",
    time: "08:05",
    date: "昨天",
    status: "sent",
  },
  {
    id: 5,
    type: "news",
    title: "今日早報",
    desc: "抓取失敗：來源逾時",
    time: "08:03",
    date: "3 天前",
    status: "error",
  },
];

const systemStatus = [
  { label: "新聞抓取", ok: true },
  { label: "職缺掃描", ok: true },
  { label: "Telegram Bot", ok: true },
  { label: "資料庫連線", ok: true },
];

export function Dashboard() {
  const today = new Date().toLocaleDateString("zh-TW", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
          早安 ☀️
        </h1>
        <p className="text-muted-foreground">{today}・今日情報摘要已就緒</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                最近推播記錄
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotifications.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === "news" ? "bg-[#F0EFFF]" : "bg-[#D1FAE5]"
                }`}>
                  {item.type === "news" ? (
                    <Newspaper className="w-4 h-4 text-[#7C6FF7]" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-[#34D399]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                    {item.status === "sent" ? (
                      <Badge className="bg-[#D1FAE5] text-[#059669] border-[#059669]/20 text-xs px-1.5 py-0">
                        已發送
                      </Badge>
                    ) : (
                      <Badge className="bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20 text-xs px-1.5 py-0">
                        失敗
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-foreground">{item.time}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                系統狀態
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemStatus.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  {s.ok ? (
                    <div className="flex items-center gap-1.5 text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium">正常</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#DC2626]">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">異常</span>
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
                <p className="text-sm text-muted-foreground">
                  立即觸發抓取或推送，不等待排程
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                執行新聞摘要
              </Button>
              <Button variant="outline" className="rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                掃描職缺
              </Button>
              <Button className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <Send className="w-4 h-4 mr-2" />
                發送測試訊息
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
