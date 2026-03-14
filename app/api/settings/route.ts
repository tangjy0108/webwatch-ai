import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ settings: null, dbConnected: false, msgCount: 0 });
  }
  try {
    const db = getServerClient();
    const { data: settings } = await db.from("settings").select("*").eq("id", 1).single();
    const { count } = await db.from("notification_logs")
      .select("*", { count: "exact", head: true })
      .gte("sent_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
    return NextResponse.json({ settings, dbConnected: true, msgCount: count ?? 0 });
  } catch {
    return NextResponse.json({ settings: null, dbConnected: false, msgCount: 0 });
  }
}

export async function POST(req: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const db = getServerClient();
    const { error } = await db.from("settings").upsert({ id: 1, ...body });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
