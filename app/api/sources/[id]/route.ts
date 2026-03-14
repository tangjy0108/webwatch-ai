import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  const body = await req.json();
  const db = getServerClient();
  const { error } = await db.from("news_sources").update(body).eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await params;
  const db = getServerClient();
  const { error } = await db.from("news_sources").delete().eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
