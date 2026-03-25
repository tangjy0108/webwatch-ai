import { NextResponse } from "next/server";
import { mergeWithDefaultSettings, sanitizeSettingsPatch } from "@/lib/settings";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

export async function GET() {
  if (isDbConfigured() === false) {
    return NextResponse.json({ settings: null, dbConnected: false, msgCount: 0 });
  }

  try {
    const db = getServerClient();
    const { data: rawSettings } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
    const { count } = await db
      .from("notification_logs")
      .select("*", { count: "exact", head: true })
      .gte("sent_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    return NextResponse.json({
      settings: mergeWithDefaultSettings(rawSettings || undefined),
      dbConnected: true,
      msgCount: count ?? 0,
    });
  } catch {
    return NextResponse.json({ settings: null, dbConnected: false, msgCount: 0 });
  }
}

export async function POST(req: Request) {
  if (isDbConfigured() === false) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const patch = sanitizeSettingsPatch(body || {});
    if (patch.news_weekend !== undefined || patch.jobs_weekend !== undefined) {
      patch.notify_weekends = Boolean((patch.news_weekend ?? false) || (patch.jobs_weekend ?? false));
    }

    const db = getServerClient();
    const { error } = await db.from("settings").upsert({ id: 1, ...patch });
    if (error) throw error;

    const { data: saved } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
    return NextResponse.json({ ok: true, settings: mergeWithDefaultSettings(saved || undefined) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
