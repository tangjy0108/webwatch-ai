export const DEFAULT_GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function getTelegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

export function getTelegramChatId(settingsChatId?: string): string {
  return process.env.TELEGRAM_CHAT_ID?.trim() || settingsChatId?.trim() || "";
}

export function isTelegramConfigured(settingsChatId?: string): boolean {
  return Boolean(getTelegramBotToken() && getTelegramChatId(settingsChatId));
}

export function getNewsAiApiKey(): string {
  return process.env.GEMINI_API_KEY?.trim()
    || process.env.GOOGLE_API_KEY?.trim()
    || process.env.NEWS_AI_API_KEY?.trim()
    || "";
}

export function getNewsAiBaseUrl(settingsBaseUrl?: string): string {
  return process.env.NEWS_AI_API_BASE_URL?.trim()
    || settingsBaseUrl?.trim()
    || DEFAULT_GEMINI_OPENAI_BASE_URL;
}

export function getNewsAiModel(settingsModel?: string): string {
  return process.env.NEWS_AI_MODEL?.trim()
    || settingsModel?.trim()
    || DEFAULT_GEMINI_MODEL;
}

export function isNewsAiConfigured(settingsModel?: string, settingsBaseUrl?: string): boolean {
  return Boolean(getNewsAiApiKey() && getNewsAiBaseUrl(settingsBaseUrl) && getNewsAiModel(settingsModel));
}
