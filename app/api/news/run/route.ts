import { NextResponse } from "next/server";
import { runNewsJob } from "@/lib/news-runner";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const result = await runNewsJob("manual");
  return NextResponse.json(result, { status: result.status });
}
