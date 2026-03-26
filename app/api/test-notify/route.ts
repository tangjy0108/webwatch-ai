import { NextResponse } from "next/server";
import { getTelegramBotToken, getTelegramChatId } from "@/lib/server-config";
import { getServerClient, isDbConfigured } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    let requestChatId = "";
    try {
      const body = await req.json();
      requestChatId = typeof body?.chatId === "string" ? body.chatId.trim() : "";
    } catch {
      requestChatId = "";
    }

    const db = getServerClient();
    const { data: settings } = await db.from("settings").select("tg_chat_id").eq("id", 1).single();
    const botToken = getTelegramBotToken();
    const chatId = requestChatId || getTelegramChatId(settings?.tg_chat_id);
    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Telegram not configured" }, { status: 400 });
    }
    const msg = `✅ <b>WebWatch AI 測試訊息</b>\n\n設定正確！你將在以下時間收到推播：\n• 早上 8:00 — 每日新聞摘要\n• 下午 5:00 — 104 職缺更新\n\n${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`;
    const ok = await sendTelegramMessage(botToken, chatId, msg);
    if (!ok) return NextResponse.json({ error: "Failed to send" }, { status: 500 });

    await db.from("notification_logs").insert({ type: "test", payload: "測試訊息", status: "sent" });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
