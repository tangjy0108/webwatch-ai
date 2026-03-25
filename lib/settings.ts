export type NewsSummaryLength = "short" | "medium" | "long";
export type JobExperiencePreference = "any" | "1" | "1-3" | "3-5" | "5+";

export interface AppSettings {
  tg_bot_token: string;
  tg_chat_id: string;
  notify_news: boolean;
  notify_jobs: boolean;
  notify_weekends: boolean;
  news_max_items: number;
  news_daily_observation: boolean;
  news_include_keywords: string[];
  news_exclude_keywords: string[];
  news_summary_length: NewsSummaryLength;
  news_weekend: boolean;
  job_keywords: string[];
  job_cities: string[];
  job_categories: string[];
  job_min_salary: number;
  job_experience: JobExperiencePreference;
  job_exclude_companies: string[];
  job_notify_new_only: boolean;
  job_notify_salary_change: boolean;
  job_notify_removed: boolean;
  jobs_weekend: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tg_bot_token: "",
  tg_chat_id: "",
  notify_news: true,
  notify_jobs: true,
  notify_weekends: false,
  news_max_items: 5,
  news_daily_observation: true,
  news_include_keywords: [],
  news_exclude_keywords: [],
  news_summary_length: "medium",
  news_weekend: false,
  job_keywords: [],
  job_cities: [],
  job_categories: [],
  job_min_salary: 0,
  job_experience: "any",
  job_exclude_companies: [],
  job_notify_new_only: true,
  job_notify_salary_change: true,
  job_notify_removed: false,
  jobs_weekend: false,
};

const SUMMARY_LENGTHS: NewsSummaryLength[] = ["short", "medium", "long"];
const EXPERIENCE_OPTIONS: JobExperiencePreference[] = ["any", "1", "1-3", "3-5", "5+"];

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toInteger(value: unknown, fallback: number, minimum = 0): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(minimum, Math.round(num));
}

function toEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

export function sanitizeSettingsPatch(input: Record<string, unknown>): Partial<AppSettings> {
  const patch: Partial<AppSettings> = {};

  if ("tg_bot_token" in input) patch.tg_bot_token = typeof input.tg_bot_token === "string" ? input.tg_bot_token.trim() : "";
  if ("tg_chat_id" in input) patch.tg_chat_id = typeof input.tg_chat_id === "string" ? input.tg_chat_id.trim() : "";
  if ("notify_news" in input) patch.notify_news = toBoolean(input.notify_news, DEFAULT_SETTINGS.notify_news);
  if ("notify_jobs" in input) patch.notify_jobs = toBoolean(input.notify_jobs, DEFAULT_SETTINGS.notify_jobs);
  if ("notify_weekends" in input) patch.notify_weekends = toBoolean(input.notify_weekends, DEFAULT_SETTINGS.notify_weekends);
  if ("news_max_items" in input) patch.news_max_items = toInteger(input.news_max_items, DEFAULT_SETTINGS.news_max_items);
  if ("news_daily_observation" in input) patch.news_daily_observation = toBoolean(input.news_daily_observation, DEFAULT_SETTINGS.news_daily_observation);
  if ("news_include_keywords" in input) patch.news_include_keywords = toStringArray(input.news_include_keywords);
  if ("news_exclude_keywords" in input) patch.news_exclude_keywords = toStringArray(input.news_exclude_keywords);
  if ("news_summary_length" in input) patch.news_summary_length = toEnum(input.news_summary_length, SUMMARY_LENGTHS, DEFAULT_SETTINGS.news_summary_length);
  if ("news_weekend" in input) patch.news_weekend = toBoolean(input.news_weekend, DEFAULT_SETTINGS.news_weekend);
  if ("job_keywords" in input) patch.job_keywords = toStringArray(input.job_keywords);
  if ("job_cities" in input) patch.job_cities = toStringArray(input.job_cities);
  if ("job_categories" in input) patch.job_categories = toStringArray(input.job_categories);
  if ("job_min_salary" in input) patch.job_min_salary = toInteger(input.job_min_salary, DEFAULT_SETTINGS.job_min_salary);
  if ("job_experience" in input) patch.job_experience = toEnum(input.job_experience, EXPERIENCE_OPTIONS, DEFAULT_SETTINGS.job_experience);
  if ("job_exclude_companies" in input) patch.job_exclude_companies = toStringArray(input.job_exclude_companies);
  if ("job_notify_new_only" in input) patch.job_notify_new_only = toBoolean(input.job_notify_new_only, DEFAULT_SETTINGS.job_notify_new_only);
  if ("job_notify_salary_change" in input) patch.job_notify_salary_change = toBoolean(input.job_notify_salary_change, DEFAULT_SETTINGS.job_notify_salary_change);
  if ("job_notify_removed" in input) patch.job_notify_removed = toBoolean(input.job_notify_removed, DEFAULT_SETTINGS.job_notify_removed);
  if ("jobs_weekend" in input) patch.jobs_weekend = toBoolean(input.jobs_weekend, DEFAULT_SETTINGS.jobs_weekend);

  return patch;
}

export function mergeWithDefaultSettings(settings: Partial<AppSettings> | null | undefined): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
    news_include_keywords: settings?.news_include_keywords || DEFAULT_SETTINGS.news_include_keywords,
    news_exclude_keywords: settings?.news_exclude_keywords || DEFAULT_SETTINGS.news_exclude_keywords,
    job_keywords: settings?.job_keywords || DEFAULT_SETTINGS.job_keywords,
    job_cities: settings?.job_cities || DEFAULT_SETTINGS.job_cities,
    job_categories: settings?.job_categories || DEFAULT_SETTINGS.job_categories,
    job_exclude_companies: settings?.job_exclude_companies || DEFAULT_SETTINGS.job_exclude_companies,
    news_summary_length: toEnum(settings?.news_summary_length, SUMMARY_LENGTHS, DEFAULT_SETTINGS.news_summary_length),
    job_experience: toEnum(settings?.job_experience, EXPERIENCE_OPTIONS, DEFAULT_SETTINGS.job_experience),
  };
}

export function isWeekendInTaipei(date = new Date()): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    weekday: "short",
  }).format(date);
  return weekday === "Sat" || weekday === "Sun";
}

export function summarizeText(text: string, length: NewsSummaryLength): string {
  const maxLength = length === "short" ? 80 : length === "long" ? 220 : 140;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}
