import { NextResponse } from "next/server";
import { getTelegramBotToken } from "@/lib/server-config";
import { verifyTelegramBot, verifyTelegramDestination } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();
    const botToken = getTelegramBotToken();
    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Missing TELEGRAM_BOT_TOKEN env" }, { status: 503 });
    }
    if (!chatId) {
      return NextResponse.json({ ok: false, error: "Missing chatId" }, { status: 400 });
    }

    const botOk = await verifyTelegramBot(botToken);
    if (botOk === false) {
      return NextResponse.json({ ok: false, error: "Invalid Bot Token" }, { status: 400 });
    }

    const destinationOk = await verifyTelegramDestination(botToken, chatId);
    if (destinationOk === false) {
      return NextResponse.json({ ok: false, error: "Chat ID not reachable yet" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Telegram verify failed" }, { status: 500 });
  }
}
