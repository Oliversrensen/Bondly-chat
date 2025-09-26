import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";
import { redis } from "@/lib/redis";

const TTL = Number(process.env.PRESENCE_TTL ?? 90); // ← longer TTL

export async function POST() {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  await redis.set(`presence:${uid}`, "1", "EX", TTL);
  return NextResponse.json({ ok: true, ttl: TTL });
}
