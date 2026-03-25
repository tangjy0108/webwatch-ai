import { NextResponse } from "next/server";
import { runJobsJob } from "@/lib/jobs-runner";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const result = await runJobsJob("manual");
  return NextResponse.json(result, { status: result.status });
}
