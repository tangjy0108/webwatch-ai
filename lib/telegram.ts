const TELEGRAM_API_BASE = "https://api.telegram.org";

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

interface TelegramChat {
  id: number;
}

async function callTelegram<T>(botToken: string, method: string, init?: RequestInit): Promise<TelegramResponse<T>> {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/${method}`, init);
    return await res.json();
  } catch {
    return { ok: false, description: "Telegram request failed" };
  }
}

export async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<boolean> {
  if (!botToken || !chatId) return false;

  const data = await callTelegram(botToken, "sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  return data.ok === true;
}

export async function verifyTelegramBot(botToken: string): Promise<boolean> {
  if (!botToken) return false;
  const data = await callTelegram(botToken, "getMe");
  return data.ok === true;
}

export async function verifyTelegramDestination(botToken: string, chatId: string): Promise<boolean> {
  if (!botToken || !chatId) return false;
  const data = await callTelegram(botToken, "getChat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId }),
  });
  return data.ok === true;
}

export async function getLatestTelegramChatId(botToken: string): Promise<string | null> {
  if (!botToken) return null;
  const data = await callTelegram<TelegramChat[]>(botToken, "getUpdates");
  if (data.ok !== true || Array.isArray(data.result) === false || data.result.length === 0) {
    return null;
  }

  const latestUpdate = data.result[data.result.length - 1] as unknown as {
    message?: { chat?: TelegramChat };
    channel_post?: { chat?: TelegramChat };
  };
  const chatId = latestUpdate.message?.chat?.id || latestUpdate.channel_post?.chat?.id;
  return chatId ? String(chatId) : null;
}
