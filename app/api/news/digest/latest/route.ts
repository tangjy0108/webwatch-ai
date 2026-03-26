import { NextResponse } from "next/server";
import { getServerClient, isDbConfigured } from "@/lib/supabase";

export async function GET() {
  if (isDbConfigured() === false) {
    return NextResponse.json({ digest: null, dbConnected: false });
  }

  try {
    const db = getServerClient();
    const { data, error } = await db
      .from("news_digests")
      .select("*")
      .order("digest_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ digest: data || null, dbConnected: true });
  } catch {
    return NextResponse.json({ digest: null, dbConnected: false }, { status: 500 });
  }
}
