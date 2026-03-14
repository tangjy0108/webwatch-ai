import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";
import { fetchRSSFeed, filterByKeywords } from "@/lib/rss";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const maxDuration = 60;

// Called by external scheduler (e.g. cron-job.org) or manually from dashboard
export async function POST() {
  return runNewsJob();
}

// Also support GET for easy testing in browser
export async function GET() {
  return runNewsJob();
}

async function runNewsJob() {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const db = getServerClient();
  try {
    // Load settings and sources
    const [{ data: settings }, { data: sources }] = await Promise.all([
      db.from("settings").select("*").eq("id", 1).single(),
      db.from("news_sources").select("*").eq("enabled", true),
    ]);

    if (!sources || sources.length === 0) {
      return NextResponse.json({ ok: true, message: "No enabled sources" });
    }

    const includeKw: string[] = settings?.news_include_keywords || [];
    const excludeKw: string[] = settings?.news_exclude_keywords || [];
    const maxItems: number = settings?.news_max_items || 5;

    // Fetch all RSS feeds in parallel
    const feedResults = await Promise.all(
      sources.map(src => fetchRSSFeed(src.feed_url, src.name, 20))
    );
    const allItems = feedResults.flat();

    // Filter by keywords
    const filtered = filterByKeywords(allItems, includeKw, excludeKw);

    // Deduplicate against DB using url_hash
    const newItems = [];
    for (const item of filtered.slice(0, maxItems * 3)) {
      const hash = Buffer.from(item.url).toString("base64").slice(0, 32);
      const { data: existing } = await db.from("news_items").select("id").eq("url_hash", hash).single();
      if (!existing) {
        newItems.push({ ...item, hash });
      }
      if (newItems.length >= maxItems) break;
    }

    if (newItems.length === 0) {
      return NextResponse.json({ ok: true, message: "No new items" });
    }

    // Store new items
    await db.from("news_items").insert(
      newItems.map(item => ({
        title: item.title,
        url: item.url,
        summary: item.summary,
        published_at: item.publishedAt,
        url_hash: item.hash,
        fetched_at: new Date().toISOString(),
      }))
    );

    // Build Telegram message
    const today = new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric" });
    let msg = `📰 <b>今日早報｜${today}</b>\n\n`;
    newItems.forEach((item, i) => {
      msg += `${i + 1}. <b>${item.title}</b>\n`;
      if (item.summary) msg += `${item.summary.slice(0, 120)}${item.summary.length > 120 ? "…" : ""}\n`;
      msg += `<a href="${item.url}">來源：${item.source}</a>\n\n`;
    });
    if (settings?.news_daily_observation) {
      msg += `💡 <b>今日觀察</b>\n今天共抓取 ${newItems.length} 則新聞。`;
    }

    // Send to Telegram
    if (settings?.tg_bot_token && settings?.tg_chat_id) {
      const ok = await sendTelegramMessage(settings.tg_bot_token, settings.tg_chat_id, msg);
      await db.from("notification_logs").insert({
        type: "news",
        payload: `今日早報：${newItems.length} 則新聞`,
        status: ok ? "sent" : "failed",
      });
    }

    return NextResponse.json({ ok: true, count: newItems.length });
  } catch (e: any) {
    console.error("News cron error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
