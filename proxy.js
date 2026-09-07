import { NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_API_REQUESTS = Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || 30);
const requests = new Map();

function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function proxy(request) {
  if (!request.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }

  const now = Date.now();
  const ip = clientIp(request);
  if (requests.size > 10_000) requests.clear();
  const bucket = (requests.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (bucket.length >= MAX_API_REQUESTS) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429, headers: { "Retry-After": "60" } });
  }
  bucket.push(now);
  requests.set(ip, bucket);
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
