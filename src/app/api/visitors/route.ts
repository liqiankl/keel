import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const VISITORS_KEY = "keel:unique_visitors";

function getRedis(): Redis | null {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

// POST — register the caller's IP, return updated unique count
export async function POST(req: NextRequest): Promise<NextResponse> {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ count: null, error: "Redis not configured" }, { status: 503 });
  }

  const ip = getIp(req);
  if (ip) {
    await redis.sadd(VISITORS_KEY, ip);
  }

  const count = await redis.scard(VISITORS_KEY);
  return NextResponse.json({ count });
}

// GET — return unique visitor count without registering
export async function GET(): Promise<NextResponse> {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ count: null, error: "Redis not configured" }, { status: 503 });
  }
  const count = await redis.scard(VISITORS_KEY);
  return NextResponse.json({ count });
}
