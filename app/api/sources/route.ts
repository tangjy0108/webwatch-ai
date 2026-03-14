import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ sources: [] });
  const db = getServerClient();
  const { data } = await db.from("news_sources").select("*").order("id");
  return NextResponse.json({ sources: data || [] });
}

export async function POST(req: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const body = await req.json();
  const db = getServerClient();
  const { data, error } = await db.from("news_sources").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ source: data });
}
