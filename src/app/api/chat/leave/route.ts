import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const uid = session?.user?.id;
    if (!uid) return new NextResponse("unauthorized", { status: 401 });

    const body = await req.json();
    const { roomId, action } = body;

    if (action === 'leave_room' && roomId) {
      console.log("Beacon leave_room received for user:", uid, "room:", roomId);
      
      // Clean up user from queues
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
        await redis.del(`match:pending:${uid}`);
        
        console.log("User cleanup completed for:", uid);
      } catch (err) {
        console.error("Failed to clean up user on beacon leave:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Beacon leave error:", error);
    return NextResponse.json({ ok: true }); // Always return success for beacons
  }
}
