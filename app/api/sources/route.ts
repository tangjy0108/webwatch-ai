import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

export async function GET() {
  if (isDbConfigured() === false) return NextResponse.json({ sources: [] });
  const db = getServerClient();
  const { data, error } = await db.from("news_sources").select("*").order("id");
  if (error) return NextResponse.json({ error: error.message, sources: [] }, { status: 500 });
  return NextResponse.json({ sources: data || [] });
}

export async function POST(req: Request) {
  if (isDbConfigured() === false) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const body = await req.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const feedUrl = typeof body?.feed_url === "string" ? body.feed_url.trim() : "";

  if (!name || !url || !feedUrl) {
    return NextResponse.json({ error: "name, url, and feed_url are required" }, { status: 400 });
  }

  const db = getServerClient();
  const { data, error } = await db
    .from("news_sources")
    .insert({ name, url, feed_url: feedUrl, enabled: body?.enabled ?? true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ source: data });
}
