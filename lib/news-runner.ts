import { fetchRSSFeed, filterByKeywords } from "@/lib/rss";
import { mergeWithDefaultSettings, isWeekendInTaipei, summarizeText } from "@/lib/settings";
import { getServerClient, isDbConfigured } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";

export type RunnerTrigger = "cron" | "manual";

export interface NewsRunResult {
  ok: boolean;
  status: number;
  count: number;
  message: string;
  sent: boolean;
  skipped: boolean;
}

function buildNewsHash(url: string): string {
  return Buffer.from(url).toString("base64").slice(0, 64);
}

export async function runNewsJob(trigger: RunnerTrigger = "cron"): Promise<NewsRunResult> {
  if (isDbConfigured() === false) {
    return { ok: false, status: 503, count: 0, message: "DB not configured", sent: false, skipped: false };
  }

  const db = getServerClient();

  try {
    const [{ data: rawSettings }, { data: sources }] = await Promise.all([
      db.from("settings").select("*").eq("id", 1).single(),
      db.from("news_sources").select("*").eq("enabled", true),
    ]);

    const settings = mergeWithDefaultSettings(rawSettings || undefined);

    if (trigger === "cron" && settings.news_weekend === false && isWeekendInTaipei()) {
      return { ok: true, status: 200, count: 0, message: "Skipped on weekend", sent: false, skipped: true };
    }

    if (!sources || sources.length === 0) {
      return { ok: true, status: 200, count: 0, message: "No enabled sources", sent: false, skipped: false };
    }

    const feedResults = await Promise.all(sources.map(source => fetchRSSFeed(source.feed_url, source.name, 20)));
    const allItems = feedResults
      .flat()
      .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());

    const filtered = filterByKeywords(allItems, settings.news_include_keywords, settings.news_exclude_keywords);
    const candidatePool = settings.news_max_items > 0 ? filtered.slice(0, settings.news_max_items * 4) : filtered;
    const candidates = candidatePool.map(item => ({ ...item, urlHash: buildNewsHash(item.url) }));

    if (candidates.length === 0) {
      return { ok: true, status: 200, count: 0, message: "No matching news items", sent: false, skipped: false };
    }

    const { data: existingHashes } = await db
      .from("news_items")
      .select("url_hash")
      .in("url_hash", candidates.map(item => item.urlHash));

    const existing = new Set((existingHashes || []).map(item => item.url_hash));
    const maxItems = settings.news_max_items > 0 ? settings.news_max_items : candidates.length;
    const newItems = candidates.filter(item => existing.has(item.urlHash) === false).slice(0, maxItems);

    if (newItems.length === 0) {
      return { ok: true, status: 200, count: 0, message: "No new items", sent: false, skipped: false };
    }

    const { error: insertError } = await db.from("news_items").insert(
      newItems.map(item => ({
        title: item.title,
        url: item.url,
        source: item.source,
        summary: item.summary,
        published_at: item.publishedAt,
        url_hash: item.urlHash,
        fetched_at: new Date().toISOString(),
      })),
    );

    if (insertError) {
      throw insertError;
    }

    let sent = false;
    if (settings.notify_news && settings.tg_bot_token && settings.tg_chat_id) {
      const today = new Date().toLocaleDateString("zh-TW", {
        timeZone: "Asia/Taipei",
        month: "numeric",
        day: "numeric",
      });
      let msg = `📰 <b>今日早報｜${today}</b>\n\n`;
      newItems.forEach((item, index) => {
        msg += `${index + 1}. <b>${item.title}</b>\n`;
        if (item.summary) {
          msg += `${summarizeText(item.summary, settings.news_summary_length)}\n`;
        }
        msg += `<a href="${item.url}">來源：${item.source}</a>\n\n`;
      });
      if (settings.news_daily_observation) {
        msg += `💡 <b>今日觀察</b>\n今天共抓取 ${newItems.length} 則新聞。`;
      }

      sent = await sendTelegramMessage(settings.tg_bot_token, settings.tg_chat_id, msg);
      await db.from("notification_logs").insert({
        type: "news",
        payload: `今日早報：${newItems.length} 則新聞`,
        status: sent ? "sent" : "failed",
      });
    }

    return { ok: true, status: 200, count: newItems.length, message: `Stored ${newItems.length} news items`, sent, skipped: false };
  } catch (error: any) {
    console.error("News cron error:", error);
    return { ok: false, status: 500, count: 0, message: error?.message || "News cron failed", sent: false, skipped: false };
  }
}
