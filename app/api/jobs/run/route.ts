import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${base}/api/cron/jobs`, { method: "POST" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
