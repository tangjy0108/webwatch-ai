import { NextResponse } from "next/server";
import { isCronAuthorized, unauthorizedCronResponse } from "@/lib/cron";
import { runNewsJob } from "@/lib/news-runner";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (isCronAuthorized(req) === false) return unauthorizedCronResponse();
  const result = await runNewsJob("cron");
  return NextResponse.json(result, { status: result.status });
}

export async function GET(req: Request) {
  if (isCronAuthorized(req) === false) return unauthorizedCronResponse();
  const result = await runNewsJob("cron");
  return NextResponse.json(result, { status: result.status });
}
