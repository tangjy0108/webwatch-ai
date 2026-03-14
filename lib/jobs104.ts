export interface Job104 {
  jobId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
}

export async function search104Jobs(keywords: string[], cities: string[], pageSize = 30): Promise<Job104[]> {
  if (keywords.length === 0) return [];
  const allJobs: Job104[] = [];

  for (const keyword of keywords) {
    const areaParam = cities.length > 0 ? cities.join(",") : "6001001000";
    const params = new URLSearchParams({
      keyword,
      area: areaParam,
      ro: "0",
      mode: "s",
      page: "1",
      pagesize: String(pageSize),
    });

    try {
      const res = await fetch(
        `https://www.104.com.tw/jobs/search/api/jobs?${params}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.104.com.tw/",
            "Accept": "application/json, text/plain, */*",
          },
        }
      );

      if (!res.ok) continue;
      const data = await res.json();
      const list = data?.data?.list || [];

      for (const job of list) {
        const jobId = String(job.jobNo || job.jobId || "");
        if (!jobId) continue;
        allJobs.push({
          jobId,
          title: job.jobName || "",
          company: job.custName || "",
          location: job.jobAddrNoDesc || "",
          salary: job.salaryDesc || "薪資面議",
          url: `https://www.104.com.tw${job.link?.job || `/job/${jobId}`}`,
        });
      }
    } catch (err) {
      console.error(`104 search failed for keyword "${keyword}":`, err);
    }
  }

  // Deduplicate by jobId
  const seen = new Set<string>();
  return allJobs.filter(j => {
    if (seen.has(j.jobId)) return false;
    seen.add(j.jobId);
    return true;
  });
}
