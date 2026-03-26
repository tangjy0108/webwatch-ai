export type NewsSummaryLength = "short" | "medium" | "long";
export type JobExperiencePreference = "any" | "1" | "1-3" | "3-5" | "5+";

export interface AppSettings {
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
  news_ai_enabled: boolean;
  news_ai_api_base_url: string;
  news_ai_model: string;
  news_ai_system_prompt: string;
  news_ai_temperature: number;
  news_ai_max_input_items: number;
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
  news_ai_enabled: false,
  news_ai_api_base_url: "https://generativelanguage.googleapis.com/v1beta/openai",
  news_ai_model: "gemini-2.5-flash",
  news_ai_system_prompt: `你是科技情報編輯，請根據提供的新聞項目整理一份中文免費版 digest。

規則：
1. 僅根據提供的新聞內容整理，不要補充未提供的事實。
2. 用繁體中文、口吻精簡、像在寫給忙碌工程師。
3. 請挑出 3 到 5 則最值得注意的新聞。
4. 每則重點都要說明「為什麼值得注意」。
5. 請回傳嚴格 JSON，不能有 markdown code fence。

JSON 格式：
{
  "title": "今日免費版標題",
  "summary": "2 到 4 句總結",
  "observation": "一句今日觀察",
  "picks": [
    {
      "itemNumber": 1,
      "angle": "一句話主題",
      "whyItMatters": "1 到 2 句說明"
    }
  ]
}`,
  news_ai_temperature: 0.2,
  news_ai_max_input_items: 8,
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

function toFloat(value: unknown, fallback: number, minimum = 0, maximum = 1): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(maximum, Math.max(minimum, Number(num.toFixed(2))));
}

function toEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

export function sanitizeSettingsPatch(input: Record<string, unknown>): Partial<AppSettings> {
  const patch: Partial<AppSettings> = {};

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
  if ("news_ai_enabled" in input) patch.news_ai_enabled = toBoolean(input.news_ai_enabled, DEFAULT_SETTINGS.news_ai_enabled);
  if ("news_ai_api_base_url" in input) {
    patch.news_ai_api_base_url = typeof input.news_ai_api_base_url === "string"
      ? input.news_ai_api_base_url.trim().replace(/\/+$/, "")
      : DEFAULT_SETTINGS.news_ai_api_base_url;
  }
  if ("news_ai_model" in input) patch.news_ai_model = typeof input.news_ai_model === "string" ? input.news_ai_model.trim() : "";
  if ("news_ai_system_prompt" in input) patch.news_ai_system_prompt = typeof input.news_ai_system_prompt === "string" ? input.news_ai_system_prompt.trim() : DEFAULT_SETTINGS.news_ai_system_prompt;
  if ("news_ai_temperature" in input) patch.news_ai_temperature = toFloat(input.news_ai_temperature, DEFAULT_SETTINGS.news_ai_temperature);
  if ("news_ai_max_input_items" in input) patch.news_ai_max_input_items = toInteger(input.news_ai_max_input_items, DEFAULT_SETTINGS.news_ai_max_input_items, 1);
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
    tg_chat_id: typeof settings?.tg_chat_id === "string" ? settings.tg_chat_id.trim() : DEFAULT_SETTINGS.tg_chat_id,
    notify_news: toBoolean(settings?.notify_news, DEFAULT_SETTINGS.notify_news),
    notify_jobs: toBoolean(settings?.notify_jobs, DEFAULT_SETTINGS.notify_jobs),
    notify_weekends: toBoolean(settings?.notify_weekends, DEFAULT_SETTINGS.notify_weekends),
    news_max_items: toInteger(settings?.news_max_items, DEFAULT_SETTINGS.news_max_items),
    news_daily_observation: toBoolean(settings?.news_daily_observation, DEFAULT_SETTINGS.news_daily_observation),
    news_include_keywords: settings?.news_include_keywords || DEFAULT_SETTINGS.news_include_keywords,
    news_exclude_keywords: settings?.news_exclude_keywords || DEFAULT_SETTINGS.news_exclude_keywords,
    news_summary_length: toEnum(settings?.news_summary_length, SUMMARY_LENGTHS, DEFAULT_SETTINGS.news_summary_length),
    news_weekend: toBoolean(settings?.news_weekend, DEFAULT_SETTINGS.news_weekend),
    news_ai_enabled: toBoolean(settings?.news_ai_enabled, DEFAULT_SETTINGS.news_ai_enabled),
    news_ai_api_base_url: settings?.news_ai_api_base_url?.trim() || DEFAULT_SETTINGS.news_ai_api_base_url,
    news_ai_model: typeof settings?.news_ai_model === "string" && settings.news_ai_model.trim()
      ? settings.news_ai_model.trim()
      : DEFAULT_SETTINGS.news_ai_model,
    news_ai_system_prompt: settings?.news_ai_system_prompt?.trim() || DEFAULT_SETTINGS.news_ai_system_prompt,
    news_ai_temperature: toFloat(settings?.news_ai_temperature, DEFAULT_SETTINGS.news_ai_temperature),
    news_ai_max_input_items: toInteger(settings?.news_ai_max_input_items, DEFAULT_SETTINGS.news_ai_max_input_items, 1),
    job_keywords: settings?.job_keywords || DEFAULT_SETTINGS.job_keywords,
    job_cities: settings?.job_cities || DEFAULT_SETTINGS.job_cities,
    job_categories: settings?.job_categories || DEFAULT_SETTINGS.job_categories,
    job_min_salary: toInteger(settings?.job_min_salary, DEFAULT_SETTINGS.job_min_salary),
    job_experience: toEnum(settings?.job_experience, EXPERIENCE_OPTIONS, DEFAULT_SETTINGS.job_experience),
    job_exclude_companies: settings?.job_exclude_companies || DEFAULT_SETTINGS.job_exclude_companies,
    job_notify_new_only: toBoolean(settings?.job_notify_new_only, DEFAULT_SETTINGS.job_notify_new_only),
    job_notify_salary_change: toBoolean(settings?.job_notify_salary_change, DEFAULT_SETTINGS.job_notify_salary_change),
    job_notify_removed: toBoolean(settings?.job_notify_removed, DEFAULT_SETTINGS.job_notify_removed),
    jobs_weekend: toBoolean(settings?.jobs_weekend, DEFAULT_SETTINGS.jobs_weekend),
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
