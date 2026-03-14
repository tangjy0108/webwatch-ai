import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const db = getServerClient();
    const { data: settings } = await db.from("settings").select("tg_bot_token,tg_chat_id").eq("id", 1).single();
    if (!settings?.tg_bot_token || !settings?.tg_chat_id) {
      return NextResponse.json({ error: "Telegram not configured" }, { status: 400 });
    }
    const msg = `✅ <b>WebWatch AI 測試訊息</b>\n\n設定正確！你將在以下時間收到推播：\n• 早上 8:00 — 每日新聞摘要\n• 下午 5:00 — 104 職缺更新\n\n${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`;
    const ok = await sendTelegramMessage(settings.tg_bot_token, settings.tg_chat_id, msg);
    if (!ok) return NextResponse.json({ error: "Failed to send" }, { status: 500 });

    await db.from("notification_logs").insert({ type: "test", payload: "測試訊息", status: "sent" });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
