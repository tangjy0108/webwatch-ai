import { NextResponse } from "next/server";
import { getLatestTelegramChatId, verifyTelegramBot } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { botToken } = await req.json();
    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Missing botToken" }, { status: 400 });
    }

    const botOk = await verifyTelegramBot(botToken);
    if (botOk === false) {
      return NextResponse.json({ ok: false, error: "Invalid Bot Token" }, { status: 400 });
    }

    const chatId = await getLatestTelegramChatId(botToken);
    if (!chatId) {
      return NextResponse.json({ ok: false, error: "No Telegram chat found yet" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, chatId });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Resolve chat id failed" }, { status: 500 });
  }
}
