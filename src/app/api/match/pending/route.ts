import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  const key = `match:pending:${uid}`;
  const roomId = await redis.get(key);

  // Checking pending match

  if (!roomId) return NextResponse.json({ roomId: null });

  const match = await prisma.match.findFirst({
    where: {
      roomId,
      OR: [{ initiatorId: uid }, { joinerId: uid }],
    },
    include: {
      initiator: { select: { id: true, sillyName: true } },
      joiner: { select: { id: true, sillyName: true } },
    },
  });

  let partnerName = "Anonymous";
  let partnerId = null;
  if (match) {
    if (match.initiatorId === uid) {
      partnerName = match.joiner.sillyName || "Anonymous";
      partnerId = match.joiner.id;
    } else {
      partnerName = match.initiator.sillyName || "Anonymous";
      partnerId = match.initiator.id;
    }
  }

  return NextResponse.json({ roomId, partnerName, partnerId });
}
