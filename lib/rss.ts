import Parser from "rss-parser";

export interface RSSItem {
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  source: string;
}

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "WebWatch-AI/1.0 RSS Reader" },
});

export async function fetchRSSFeed(feedUrl: string, sourceName: string, maxItems = 10): Promise<RSSItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items || []).slice(0, maxItems).map(item => ({
      title: item.title || "",
      url: item.link || item.guid || "",
      summary: stripHtml(item.contentSnippet || item.content || item.summary || ""),
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      source: sourceName,
    })).filter(i => i.title && i.url);
  } catch (err) {
    console.error(`RSS fetch failed for ${feedUrl}:`, err);
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim().slice(0, 300);
}

export function filterByKeywords(items: RSSItem[], include: string[], exclude: string[]): RSSItem[] {
  return items.filter(item => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    if (exclude.length > 0 && exclude.some(kw => text.includes(kw.toLowerCase()))) return false;
    if (include.length === 0) return true;
    return include.some(kw => text.includes(kw.toLowerCase()));
  });
}
