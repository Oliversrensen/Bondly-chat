import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-full";

export const runtime = "nodejs";

/**
 * POST /api/report
 * Body:
 *  - roomId?: string        // preferred: we resolve who the "other" user is from the Match
 *  - offenderId?: string    // optional explicit target (must be in the room if roomId given)
 *  - reason?: string        // optional freeform note
 *  - messages?: Array<{ text: string; authorId?: string; at: number }> // optional recent msgs (last 20 kept)
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const reporterId = session?.user?.id;
  if (!reporterId) return new NextResponse("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { roomId, offenderId, reason: reasonText, messages } = body as {
    roomId?: string;
    offenderId?: string;
    reason?: string;
    messages?: Array<{ text: string; authorId?: string; at: number }>;
  };

  if (!roomId && !offenderId) {
    return new NextResponse("roomId or offenderId required", { status: 400 });
  }

  // Look up the match by room if provided
  let match:
    | { initiatorId: string; joinerId: string; id: string }
    | null = null;

  if (roomId) {
    match = await prisma.match.findUnique({
      where: { roomId },
      select: { initiatorId: true, joinerId: true, id: true },
    });
    if (!match) return new NextResponse("room not found", { status: 404 });
  }

  // Determine the reported user
  let reportedUserId: string | undefined;
  if (offenderId) {
    if (match) {
      const inRoom =
        offenderId === match.initiatorId || offenderId === match.joinerId;
      if (!inRoom) {
        return new NextResponse("offender not in room", { status: 400 });
      }
    }
    reportedUserId = offenderId;
  } else if (match) {
    // Report the "other" participant in the room
    reportedUserId =
      match.initiatorId === reporterId ? match.joinerId : match.initiatorId;
  }

  if (!reportedUserId) {
    return new NextResponse("cannot resolve reported user", { status: 400 });
  }

  // Build structured payload and store as JSON string in Report.reason
  const payload = {
    type: "user_report",
    by: reporterId,
    reportedUserId,
    roomId: roomId ?? null,
    at: new Date().toISOString(),
    note: typeof reasonText === "string" ? reasonText.slice(0, 1000) : "",
    // Keep only the last 20 messages, and only necessary fields
    recentMessages: Array.isArray(messages)
      ? messages.slice(-20).map((m) => ({
          text: String(m.text || "").slice(0, 500),
          authorId: m.authorId || null,
          at: m.at || Date.now(),
        }))
      : undefined,
  };

  const saved = await prisma.report.create({
    data: {
      reporterId,
      reportedUserId,
      reason: JSON.stringify(payload),
    },
  });

  return NextResponse.json({ ok: true, id: saved.id });
}
