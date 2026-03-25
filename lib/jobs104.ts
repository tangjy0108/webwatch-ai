import type { JobExperiencePreference } from "@/lib/settings";

export interface Job104 {
  jobId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  description: string;
  salaryLow: number;
  salaryHigh: number;
  categoryCodes: number[];
  categoryTags: string[];
  experienceBucket: JobExperiencePreference;
}

export interface JobSearchOptions {
  cities: string[];
  categories?: string[];
  minSalary?: number;
  experience?: JobExperiencePreference;
  excludeCompanies?: string[];
  pageSize?: number;
}

const CATEGORY_MATCHERS: Record<string, string[]> = {
  product: ["產品", "product", "pm", "product manager", "產品經理", "產品企劃", "po"],
  engineer: ["工程師", "engineer", "developer", "frontend", "backend", "full stack", "軟體", "研發"],
  data: ["data", "數據", "資料", "分析", "bi", "data analyst", "data scientist", "machine learning", "ai engineer"],
  marketing: ["行銷", "marketing", "growth", "品牌", "社群", "內容", "廣告"],
  design: ["設計", "designer", "ux", "ui", "visual", "產品設計", "視覺"],
  management: ["專案", "project manager", "program manager", "scrum", "product owner", "管理"],
};

const PERIOD_TO_EXPERIENCE: Record<number, JobExperiencePreference> = {
  1: "1",
  2: "1",
  3: "1-3",
  4: "1-3",
  5: "3-5",
  6: "3-5",
  7: "5+",
  8: "5+",
};

function formatSalary(low: number, high: number): string {
  if (low > 0 && high > 0) return `${low.toLocaleString("en-US")} - ${high.toLocaleString("en-US")}`;
  if (low > 0) return `${low.toLocaleString("en-US")}+`;
  if (high > 0) return `${high.toLocaleString("en-US")}`;
  return "薪資面議";
}

function classifyCategories(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  return Object.entries(CATEGORY_MATCHERS)
    .filter(([, patterns]) => patterns.some(pattern => text.includes(pattern.toLowerCase())))
    .map(([key]) => key);
}

function inferExperienceBucket(period: number, text: string): JobExperiencePreference {
  const normalized = text.replace(/\s+/g, "").toLowerCase();
  if (/無經驗|新鮮人|1年以下|一年以下/.test(normalized)) return "1";
  if (/1[-~至到]3年|1年以上|2年以上|3年以下/.test(normalized)) return "1-3";
  if (/3[-~至到]5年|3年以上|4年以上|5年以下/.test(normalized)) return "3-5";
  if (/5年以上|六年以上|6年以上|senior|資深/.test(normalized)) return "5+";
  return PERIOD_TO_EXPERIENCE[period] || "any";
}

function matchesCategory(selected: string[], tags: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.some(item => tags.includes(item));
}

function matchesSalary(minSalary: number, low: number, high: number): boolean {
  if (minSalary <= 0) return true;
  const comparable = Math.max(low || 0, high || 0);
  if (comparable > 0) return comparable >= minSalary;
  return false;
}

function matchesExperience(preferred: JobExperiencePreference, actual: JobExperiencePreference): boolean {
  if (preferred === "any") return true;
  if (actual === "any") return true;
  if (preferred === actual) return true;
  if (preferred === "1-3" && actual === "1") return true;
  return false;
}

function isExcludedCompany(company: string, excluded: string[]): boolean {
  const normalized = company.toLowerCase();
  return excluded.some(item => normalized.includes(item.toLowerCase()));
}

export async function search104Jobs(
  keywords: string[],
  {
    cities,
    categories = [],
    minSalary = 0,
    experience = "any",
    excludeCompanies = [],
    pageSize = 30,
  }: JobSearchOptions,
): Promise<Job104[]> {
  if (keywords.length === 0) return [];

  const allJobs: Job104[] = [];
  const areaParam = cities.length > 0 ? cities.join(",") : "6001001000";

  for (const keyword of keywords) {
    const params = new URLSearchParams({
      keyword,
      area: areaParam,
      ro: "0",
      mode: "s",
      page: "1",
      pagesize: String(pageSize),
    });

    try {
      const res = await fetch(`https://www.104.com.tw/jobs/search/api/jobs?${params}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://www.104.com.tw/",
          Accept: "application/json, text/plain, */*",
        },
      });

      if (res.ok !== true) continue;
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : [];

      for (const job of list) {
        const jobId = String(job.jobNo || job.jobId || "");
        if (!jobId) continue;

        const title = job.jobName || "";
        const description = job.description || job.descSnippet || "";
        const company = job.custName || "";
        const salaryLow = Number(job.salaryLow) || 0;
        const salaryHigh = Number(job.salaryHigh) || 0;
        const categoryTags = classifyCategories(title, description);
        const experienceBucket = inferExperienceBucket(Number(job.period) || 0, `${description} ${title}`);

        if (matchesCategory(categories, categoryTags) === false) continue;
        if (matchesSalary(minSalary, salaryLow, salaryHigh) === false) continue;
        if (matchesExperience(experience, experienceBucket) === false) continue;
        if (isExcludedCompany(company, excludeCompanies) === true) continue;

        allJobs.push({
          jobId,
          title,
          company,
          location: job.jobAddrNoDesc || "",
          salary: typeof job.salaryDesc === "string" && job.salaryDesc ? job.salaryDesc : formatSalary(salaryLow, salaryHigh),
          url: `https://www.104.com.tw${job.link?.job || `/job/${jobId}`}`,
          description,
          salaryLow,
          salaryHigh,
          categoryCodes: Array.isArray(job.jobCat) ? job.jobCat.map((item: unknown) => Number(item)).filter((item: number) => Number.isFinite(item)) : [],
          categoryTags,
          experienceBucket,
        });
      }
    } catch (err) {
      console.error(`104 search failed for keyword "${keyword}":`, err);
    }
  }

  const seen = new Set<string>();
  return allJobs.filter(job => {
    if (seen.has(job.jobId)) return false;
    seen.add(job.jobId);
    return true;
  });
}
