import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const PENDING = (u: string) => `match:pending:${u}`;

export async function POST(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  console.log("LEAVE", uid);

  try {
    // Remove from random queue + TTL shadow
    await redis.lrem("queue:random", 0, uid);
    await redis.del(`queue:random:user:${uid}`);

    // Remove from all interest queues + TTL shadows
    const myInterests = await prisma.interestOnUser.findMany({
      where: { userId: uid },
      include: { interest: true },
    });
    for (const i of myInterests) {
      const qKey = `queue:interest:${i.interest.name.toLowerCase()}`;
      await redis.lrem(qKey, 0, uid);
      await redis.del(`${qKey}:user:${uid}`);
    }

    // Remove any pending room assignment
    await redis.del(PENDING(uid));
  } catch (err) {
    console.error("Failed to clean up user on leave:", err);
  }

  return NextResponse.json({ ok: true });
}
