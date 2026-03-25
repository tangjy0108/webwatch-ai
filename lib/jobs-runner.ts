import { search104Jobs, type Job104 } from "@/lib/jobs104";
import { mergeWithDefaultSettings, isWeekendInTaipei } from "@/lib/settings";
import { getServerClient, isDbConfigured } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";

export type RunnerTrigger = "cron" | "manual";

export interface JobsRunResult {
  ok: boolean;
  status: number;
  total: number;
  newCount: number;
  salaryChangedCount: number;
  removedCount: number;
  message: string;
  sent: boolean;
  skipped: boolean;
}

interface StoredJobRecord {
  job_id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  url: string | null;
  is_active: boolean | null;
}

function summarizeJobs(title: string, jobs: Job104[], formatter: (job: Job104) => string): string {
  if (jobs.length === 0) return "";
  let block = `${title}\n`;
  jobs.slice(0, 5).forEach((job, index) => {
    block += `${index + 1}. <b>${job.title}</b>\n`;
    block += `🏢 ${job.company}`;
    if (job.location) block += ` · 📍 ${job.location}`;
    block += "\n";
    block += `${formatter(job)}\n`;
    block += `<a href="${job.url}">查看職缺</a>\n\n`;
  });
  if (jobs.length > 5) {
    block += `⋯ 還有 ${jobs.length - 5} 筆\n\n`;
  }
  return block;
}

export async function runJobsJob(trigger: RunnerTrigger = "cron"): Promise<JobsRunResult> {
  if (isDbConfigured() === false) {
    return { ok: false, status: 503, total: 0, newCount: 0, salaryChangedCount: 0, removedCount: 0, message: "DB not configured", sent: false, skipped: false };
  }

  const db = getServerClient();

  try {
    const { data: rawSettings } = await db.from("settings").select("*").eq("id", 1).single();
    const settings = mergeWithDefaultSettings(rawSettings || undefined);

    if (trigger === "cron" && settings.jobs_weekend === false && isWeekendInTaipei()) {
      return { ok: true, status: 200, total: 0, newCount: 0, salaryChangedCount: 0, removedCount: 0, message: "Skipped on weekend", sent: false, skipped: true };
    }

    if (settings.job_keywords.length === 0) {
      return { ok: true, status: 200, total: 0, newCount: 0, salaryChangedCount: 0, removedCount: 0, message: "No job keywords configured", sent: false, skipped: false };
    }

    const jobs = await search104Jobs(settings.job_keywords, {
      cities: settings.job_cities,
      categories: settings.job_categories,
      minSalary: settings.job_min_salary,
      experience: settings.job_experience,
      excludeCompanies: settings.job_exclude_companies,
      pageSize: 50,
    });

    const { data: storedJobs } = await db.from("job_items").select("*");
    const trackedJobs = (storedJobs || []) as StoredJobRecord[];
    const storedById = new Map(trackedJobs.map(job => [job.job_id, job]));

    const newJobs = jobs.filter(job => storedById.has(job.jobId) === false);
    const salaryChangedJobs = jobs.filter(job => {
      const previous = storedById.get(job.jobId);
      return previous ? previous.salary !== job.salary : false;
    });

    let removedJobs: StoredJobRecord[] = [];
    if (jobs.length > 0) {
      const currentIds = new Set(jobs.map(job => job.jobId));
      removedJobs = trackedJobs.filter(job => job.is_active === true && currentIds.has(job.job_id) === false);
    }

    const now = new Date().toISOString();
    if (jobs.length > 0) {
      const upsertPayload = jobs.map(job => ({
        job_id: job.jobId,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        url: job.url,
        description: job.description,
        salary_low: job.salaryLow,
        salary_high: job.salaryHigh,
        category_tags: job.categoryTags,
        experience_bucket: job.experienceBucket,
        first_seen_at: storedById.get(job.jobId) ? undefined : now,
        last_seen_at: now,
        is_active: true,
        removed_at: null,
      }));
      const { error: upsertError } = await db.from("job_items").upsert(upsertPayload, { onConflict: "job_id" });
      if (upsertError) throw upsertError;
    }

    if (removedJobs.length > 0) {
      const { error: removeError } = await db
        .from("job_items")
        .update({ is_active: false, removed_at: now })
        .in("job_id", removedJobs.map(job => job.job_id));
      if (removeError) throw removeError;
    }

    const includeSalaryChanges = settings.job_notify_new_only === false && settings.job_notify_salary_change;
    const includeRemoved = settings.job_notify_new_only === false && settings.job_notify_removed;
    const shouldNotify = newJobs.length > 0 || (includeSalaryChanges && salaryChangedJobs.length > 0) || (includeRemoved && removedJobs.length > 0);

    let sent = false;
    if (shouldNotify && settings.notify_jobs && settings.tg_bot_token && settings.tg_chat_id) {
      const today = new Date().toLocaleDateString("zh-TW", {
        timeZone: "Asia/Taipei",
        month: "numeric",
        day: "numeric",
      });
      let msg = `💼 <b>職缺更新｜${today}</b>\n\n`;
      if (newJobs.length > 0) {
        msg += summarizeJobs(`🆕 新增職缺 ${newJobs.length} 筆`, newJobs, job => (job.salary ? `💰 ${job.salary}` : ""));
      }
      if (includeSalaryChanges && salaryChangedJobs.length > 0) {
        msg += summarizeJobs(`💸 薪資變動 ${salaryChangedJobs.length} 筆`, salaryChangedJobs, job => {
          const previous = storedById.get(job.jobId);
          return `💰 ${previous?.salary || "未知"} → ${job.salary}`;
        });
      }
      if (includeRemoved && removedJobs.length > 0) {
        const mappedRemoved = removedJobs.map(job => ({
          jobId: job.job_id,
          title: job.title || "已下架職缺",
          company: job.company || "未知公司",
          location: job.location || "",
          salary: job.salary || "薪資面議",
          url: job.url || "https://www.104.com.tw/",
          description: "",
          salaryLow: 0,
          salaryHigh: 0,
          categoryCodes: [],
          categoryTags: [],
          experienceBucket: "any" as const,
        }));
        msg += summarizeJobs(`📪 已下架 ${removedJobs.length} 筆`, mappedRemoved, job => (job.salary ? `💰 ${job.salary}` : ""));
      }

      sent = await sendTelegramMessage(settings.tg_bot_token, settings.tg_chat_id, msg.trim());
      await db.from("notification_logs").insert({
        type: "jobs",
        payload: `職缺更新：新增 ${newJobs.length}、薪資變動 ${includeSalaryChanges ? salaryChangedJobs.length : 0}、下架 ${includeRemoved ? removedJobs.length : 0}`,
        status: sent ? "sent" : "failed",
      });
    }

    return {
      ok: true,
      status: 200,
      total: jobs.length,
      newCount: newJobs.length,
      salaryChangedCount: salaryChangedJobs.length,
      removedCount: removedJobs.length,
      message: shouldNotify ? "Tracked job changes" : "No job changes",
      sent,
      skipped: false,
    };
  } catch (error: any) {
    console.error("Jobs cron error:", error);
    return {
      ok: false,
      status: 500,
      total: 0,
      newCount: 0,
      salaryChangedCount: 0,
      removedCount: 0,
      message: error?.message || "Jobs cron failed",
      sent: false,
      skipped: false,
    };
  }
}
