import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ logs: [], stats: { newsToday: 0, notificationsToday: 0, newJobsToday: 0, lastRun: null, tgConnected: false } });
  }
  try {
    const db = getServerClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [logsRes, newsRes, jobsRes, settingsRes] = await Promise.all([
      db.from("notification_logs").select("*").order("sent_at", { ascending: false }).limit(20),
      db.from("news_items").select("id", { count: "exact", head: true }).gte("fetched_at", todayStart.toISOString()),
      db.from("job_items").select("id", { count: "exact", head: true }).gte("first_seen_at", todayStart.toISOString()),
      db.from("settings").select("tg_bot_token,tg_chat_id").eq("id", 1).single(),
    ]);

    const logs = logsRes.data || [];
    const lastLog = logs[0];

    return NextResponse.json({
      logs,
      stats: {
        newsToday: newsRes.count ?? 0,
        notificationsToday: logs.filter(l => new Date(l.sent_at) >= todayStart).length,
        newJobsToday: jobsRes.count ?? 0,
        lastRun: lastLog?.sent_at || null,
        tgConnected: !!(settingsRes.data?.tg_bot_token && settingsRes.data?.tg_chat_id),
      },
    });
  } catch {
    return NextResponse.json({ logs: [], stats: { newsToday: 0, notificationsToday: 0, newJobsToday: 0, lastRun: null, tgConnected: false } });
  }
}
