import { NextResponse } from "next/server";
import { isTelegramConfigured } from "@/lib/server-config";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

function emptyResponse() {
  return {
    logs: [],
    latestDigest: null,
    stats: {
      newsToday: 0,
      notificationsToday: 0,
      newJobsToday: 0,
      lastRun: null,
      tgConnected: false,
      dbConnected: false,
    },
  };
}

export async function GET() {
  if (isDbConfigured() === false) {
    return NextResponse.json(emptyResponse());
  }

  try {
    const db = getServerClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [logsRes, newsRes, jobsRes, settingsRes, digestRes] = await Promise.all([
      db.from("notification_logs").select("*").order("sent_at", { ascending: false }).limit(20),
      db.from("news_items").select("id", { count: "exact", head: true }).gte("fetched_at", todayStart.toISOString()),
      db.from("job_items").select("id", { count: "exact", head: true }).gte("first_seen_at", todayStart.toISOString()),
      db.from("settings").select("tg_chat_id").eq("id", 1).maybeSingle(),
      db.from("news_digests").select("*").order("digest_date", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const logs = logsRes.data || [];
    const lastLog = logs[0];

    return NextResponse.json({
      logs,
      latestDigest: digestRes.data || null,
      stats: {
        newsToday: newsRes.count ?? 0,
        notificationsToday: logs.filter(log => new Date(log.sent_at) >= todayStart && log.status === "sent").length,
        newJobsToday: jobsRes.count ?? 0,
        lastRun: lastLog?.sent_at || null,
        tgConnected: isTelegramConfigured(settingsRes.data?.tg_chat_id),
        dbConnected: true,
      },
    });
  } catch {
    return NextResponse.json(emptyResponse());
  }
}
