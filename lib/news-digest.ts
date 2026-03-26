import { RSSItem } from "@/lib/rss";
import { AppSettings } from "@/lib/settings";
import { getNewsAiApiKey, getNewsAiBaseUrl, getNewsAiModel, isNewsAiConfigured } from "@/lib/server-config";

export interface NewsDigestPick {
  itemNumber: number;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  angle: string;
  whyItMatters: string;
}

export interface GeneratedNewsDigest {
  title: string;
  summary: string;
  observation: string;
  picks: NewsDigestPick[];
  model: string;
  itemCount: number;
  sourceCount: number;
}

interface RawDigestPick {
  itemNumber?: unknown;
  angle?: unknown;
  whyItMatters?: unknown;
}

interface RawDigestResponse {
  title?: unknown;
  summary?: unknown;
  observation?: unknown;
  picks?: unknown;
}

const DIGEST_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "news_digest",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        observation: { type: "string" },
        picks: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              itemNumber: { type: "integer" },
              angle: { type: "string" },
              whyItMatters: { type: "string" },
            },
            required: ["itemNumber", "angle", "whyItMatters"],
          },
        },
      },
      required: ["title", "summary", "observation", "picks"],
    },
  },
} as const;

export function isNewsDigestConfigured(settings: AppSettings): boolean {
  return Boolean(settings.news_ai_enabled && isNewsAiConfigured(settings.news_ai_model, settings.news_ai_api_base_url));
}

export async function generateNewsDigest(items: RSSItem[], settings: AppSettings): Promise<GeneratedNewsDigest> {
  if (isNewsDigestConfigured(settings) === false) {
    throw new Error("News digest AI is not configured");
  }

  const apiKey = getNewsAiApiKey();
  const apiBaseUrl = getNewsAiBaseUrl(settings.news_ai_api_base_url);
  const model = getNewsAiModel(settings.news_ai_model);
  const limitedItems = items.slice(0, Math.max(1, settings.news_ai_max_input_items));
  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: settings.news_ai_temperature,
      max_tokens: 1000,
      response_format: DIGEST_RESPONSE_FORMAT,
      messages: [
        {
          role: "system",
          content: settings.news_ai_system_prompt,
        },
        {
          role: "user",
          content: buildDigestUserPrompt(limitedItems),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Digest API failed (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const payload = await response.json();
  const content = extractAssistantContent(payload);
  const parsed = parseDigestPayload(content, limitedItems);

  return normalizeDigest(parsed, limitedItems, model);
}

function buildDigestUserPrompt(items: RSSItem[]): string {
  const lines = items.map((item, index) => [
    `${index + 1}. [${item.source}] ${item.title}`,
    `URL: ${item.url}`,
    `Published: ${item.publishedAt}`,
    `Summary: ${sanitizeInline(item.summary) || "N/A"}`,
  ].join("\n"));

  return [
    "請根據以下新聞項目產出今日免費版 digest。",
    "注意：只能使用以下資料，不可杜撰額外資訊。",
    "請挑出 3 到 5 則重點，並用 itemNumber 指回原始項目。",
    "你必須只回傳單一 JSON 物件，不要加上 markdown、前言、結語或任何額外說明。",
    "",
    lines.join("\n\n"),
  ].join("\n");
}

function extractAssistantContent(payload: any): string {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(part => (typeof part?.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n");
  }
  throw new Error("Digest API returned empty content");
}

function parseDigestPayload(content: string, items: RSSItem[]): RawDigestResponse {
  try {
    const jsonText = extractJsonObject(content);
    return JSON.parse(jsonText) as RawDigestResponse;
  } catch {
    return buildFallbackRawDigest(content, items);
  }
}

function extractJsonObject(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  throw new Error("Digest response did not contain JSON");
}

function buildFallbackRawDigest(content: string, items: RSSItem[]): RawDigestResponse {
  const normalized = trimParagraph(content, 280);
  const picks = items.slice(0, Math.min(3, items.length)).map((item, index) => ({
    itemNumber: index + 1,
    angle: "值得留意",
    whyItMatters: trimParagraph(item.summary, 140) || "這則更新值得追蹤後續發展。",
  }));

  return {
    title: "今日科技免費版 Digest",
    summary: normalized || `今天整理了 ${items.length} 則值得留意的科技更新。`,
    observation: normalized ? trimParagraph(normalized, 120) : "",
    picks,
  };
}

function normalizeDigest(raw: RawDigestResponse, items: RSSItem[], model: string): GeneratedNewsDigest {
  const fallbackPicks = items.slice(0, Math.min(3, items.length)).map((item, index) => ({
    itemNumber: index + 1,
    title: item.title,
    source: item.source,
    url: item.url,
    publishedAt: item.publishedAt,
    angle: "值得留意",
    whyItMatters: trimParagraph(item.summary, 120) || "這則更新值得追蹤後續發展。",
  }));

  const rawPicks = Array.isArray(raw.picks) ? raw.picks as RawDigestPick[] : [];
  const seenNumbers = new Set<number>();
  const picks = rawPicks
    .map(pick => {
      const itemNumber = Number(pick.itemNumber);
      if (!Number.isInteger(itemNumber) || itemNumber < 1 || itemNumber > items.length || seenNumbers.has(itemNumber)) {
        return null;
      }
      seenNumbers.add(itemNumber);

      const sourceItem = items[itemNumber - 1];
      return {
        itemNumber,
        title: sourceItem.title,
        source: sourceItem.source,
        url: sourceItem.url,
        publishedAt: sourceItem.publishedAt,
        angle: trimParagraph(toCleanString(pick.angle), 40) || "值得留意",
        whyItMatters: trimParagraph(toCleanString(pick.whyItMatters), 140) || trimParagraph(sourceItem.summary, 120) || "這則更新值得追蹤後續發展。",
      };
    })
    .filter((pick): pick is NewsDigestPick => pick !== null)
    .slice(0, 5);

  return {
    title: trimParagraph(toCleanString(raw.title), 60) || "今日科技免費版 Digest",
    summary: trimParagraph(toCleanString(raw.summary), 280) || `今天整理了 ${items.length} 則值得留意的科技更新。`,
    observation: trimParagraph(toCleanString(raw.observation), 120),
    picks: picks.length > 0 ? picks : fallbackPicks,
    model,
    itemCount: items.length,
    sourceCount: new Set(items.map(item => item.source)).size,
  };
}

function toCleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function trimParagraph(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

function sanitizeInline(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
