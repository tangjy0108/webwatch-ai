import { NextResponse } from "next/server";

export function getCronSecret(): string {
  return process.env.CRON_SECRET || "";
}

export function isCronAuthorized(req: Request): boolean {
  const secret = getCronSecret();
  if (!secret) return true;

  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const altHeader = req.headers.get("x-cron-secret")?.trim() || "";
  return bearer === secret || altHeader === secret;
}

export function unauthorizedCronResponse() {
  return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
}
