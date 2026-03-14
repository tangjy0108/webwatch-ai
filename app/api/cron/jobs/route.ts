import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";
import { search104Jobs } from "@/lib/jobs104";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const maxDuration = 60;

// Called by external scheduler (e.g. cron-job.org) or manually from dashboard
export async function POST() {
  return runJobsJob();
}

// Also support GET for easy testing in browser
export async function GET() {
  return runJobsJob();
}

async function runJobsJob() {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const db = getServerClient();
  try {
    const { data: settings } = await db.from("settings").select("*").eq("id", 1).single();

    const keywords: string[] = settings?.job_keywords || [];
    const cities: string[] = settings?.job_cities || [];

    if (keywords.length === 0) {
      return NextResponse.json({ ok: true, message: "No job keywords configured" });
    }

    // Fetch from 104
    const jobs = await search104Jobs(keywords, cities, 30);

    if (jobs.length === 0) {
      return NextResponse.json({ ok: true, message: "No jobs found" });
    }

    // Find new jobs (not in DB)
    const newJobs: typeof jobs = [];
    for (const job of jobs) {
      const { data: existing } = await db
        .from("job_items")
        .select("id")
        .eq("job_id", job.jobId)
        .single();

      if (!existing) {
        newJobs.push(job);
      }
    }

    // Update last_seen_at for existing active jobs
    const existingIds = jobs.map(j => j.jobId).filter(id => !newJobs.find(n => n.jobId === id));
    if (existingIds.length > 0) {
      await db
        .from("job_items")
        .update({ last_seen_at: new Date().toISOString() })
        .in("job_id", existingIds);
    }

    // Insert new jobs
    if (newJobs.length > 0) {
      await db.from("job_items").insert(
        newJobs.map(job => ({
          job_id: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          url: job.url,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          is_active: true,
        }))
      );
    }

    // Only notify if there are new jobs (or settings say always notify)
    const notifyNewOnly: boolean = settings?.job_notify_new_only ?? true;
    const itemsToNotify = notifyNewOnly ? newJobs : jobs.slice(0, 10);

    if (itemsToNotify.length === 0) {
      return NextResponse.json({ ok: true, count: 0, message: "No new jobs" });
    }

    // Build Telegram message
    const today = new Date().toLocaleDateString("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "numeric",
      day: "numeric",
    });
    let msg = `💼 <b>職缺更新｜${today}</b>\n`;
    msg += `共發現 ${itemsToNotify.length} 個${notifyNewOnly ? "新" : ""}職缺\n\n`;

    itemsToNotify.slice(0, 10).forEach((job, i) => {
      msg += `${i + 1}. <b>${job.title}</b>\n`;
      msg += `🏢 ${job.company}`;
      if (job.location) msg += ` · 📍 ${job.location}`;
      msg += `\n`;
      if (job.salary) msg += `💰 ${job.salary}\n`;
      msg += `<a href="${job.url}">查看職缺</a>\n\n`;
    });

    if (itemsToNotify.length > 10) {
      msg += `⋯ 還有 ${itemsToNotify.length - 10} 個職缺\n`;
    }

    // Send to Telegram
    if (settings?.tg_bot_token && settings?.tg_chat_id) {
      const ok = await sendTelegramMessage(settings.tg_bot_token, settings.tg_chat_id, msg);
      await db.from("notification_logs").insert({
        type: "jobs",
        payload: `職缺更新：${itemsToNotify.length} 個職缺`,
        status: ok ? "sent" : "failed",
      });
    }

    return NextResponse.json({ ok: true, count: newJobs.length, total: jobs.length });
  } catch (e: any) {
    console.error("Jobs cron error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
