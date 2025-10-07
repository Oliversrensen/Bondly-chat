import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-full";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const SELF_MATCH_DEV =
  process.env.ALLOW_SELF_MATCH === "true" && process.env.NODE_ENV !== "production";

const PENDING = (u: string) => `match:pending:${u}`;
const PRESENCE = (u: string) => `presence:${u}`;
const QUEUE_TTL = 180; // 3 minutes

// Guest queue constants for cross-matching
const GUEST_PRESENCE = (guestId: string) => `guest:presence:${guestId}`;
const GUEST_PENDING = (guestId: string) => `guest:match:pending:${guestId}`;
const GUEST_QUEUE_TTL = 300; // 5 minutes for guest queue

// Normalize DB gender → "MALE" | "FEMALE" | "UNDISCLOSED"
function normalizeGender(
  g: string | null | undefined,
): "MALE" | "FEMALE" | "UNDISCLOSED" {
  if (!g) return "UNDISCLOSED";
  const upper = g.toUpperCase();
  if (upper.startsWith("MALE")) return "MALE";
  if (upper.startsWith("FEMALE")) return "FEMALE";
  return "UNDISCLOSED";
}

// Normalize filter input
function normalizeFilter(
  raw: unknown,
): "MALE" | "FEMALE" | "ANY" {
  if (raw === "MALE" || raw === "FEMALE") return raw;
  return "ANY";
}

// Notify both users of the match (handles guest + real user combinations)
async function notifyPair(uidA: string, uidB: string, roomId: string, isGuestA: boolean = false, isGuestB: boolean = false) {
  // Notifying pair of match
  try {
    if (isGuestA) {
      await redis.set(GUEST_PENDING(uidA), roomId, "EX", 120);
    } else {
      await redis.set(PENDING(uidA), roomId, "EX", 120);
    }
  } catch (err) {
    console.error("Failed to set pending for", uidA, err);
  }
  try {
    if (isGuestB) {
      await redis.set(GUEST_PENDING(uidB), roomId, "EX", 120);
    } else {
      await redis.set(PENDING(uidB), roomId, "EX", 120);
    }
  } catch (err) {
    console.error("Failed to set pending for", uidB, err);
  }
}

export async function POST(req: NextRequest) {
  const { mode, genderFilter } = await req.json().catch(() => ({ mode: "random" }));
  if (mode !== "random" && mode !== "interest") {
    return new NextResponse("bad mode", { status: 400 });
  }

  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  // Load my profile from DB directly
  const me = await prisma.user.findUnique({
    where: { id: uid },
    select: { isPro: true, gender: true },
  });
  const myGender = normalizeGender(me?.gender);
  const myFilter: "MALE" | "FEMALE" | "ANY" =
    me?.isPro && genderFilter ? normalizeFilter(genderFilter) : "ANY";

  // User enqueued for matching

  // Set presence TTL
  const presenceTtl = Number(process.env.PRESENCE_TTL ?? 90);
  await redis.set(PRESENCE(uid), "1", "EX", presenceTtl);

  // -------------------
  // RANDOM MODE
  // -------------------
  if (mode === "random") {
    let matchFound = false;
    let roomId = "";
    let partnerName = "Anonymous";
    let partnerId = "";

    // First, try to find another real user
    for (let i = 0; i < 30; i++) {
      const other = await redis.lpop("queue:random");
      if (!other) break;

      const alive = await redis.exists(`queue:random:user:${other}`);
      if (!alive) {
        // Stale candidate expired
        continue;
      }

      if (other === uid && !SELF_MATCH_DEV) {
        // Skip self popped entry
        continue;
      }

      const result = await redis.pipeline().exists(PRESENCE(other)).exec();
      const live = result?.[0]?.[1];
      if (live !== 1) {
        // Candidate offline
        continue;
      }

      // Check if this is a guest user (starts with "guest_")
      const isGuest = other.startsWith("guest_");
      
      if (isGuest) {
        // It's a guest user - match with them
        roomId = `mixed_${randomUUID().slice(0, 12)}`;
        partnerName = "Anonymous Guest";
        partnerId = other;
        await notifyPair(uid, other, roomId, false, true);
        matchFound = true;
        break;
      } else {
        // It's a real user - get their info from DB
        const otherUser = await prisma.user.findUnique({
          where: { id: other },
          select: { gender: true, sillyName: true, isPro: true },
        });
        if (!otherUser) continue;

        const otherGender = normalizeGender(otherUser.gender);

        // My filter check
        if (myFilter !== "ANY" && otherGender !== myFilter) {
          await redis.rpush("queue:random", other);
          continue;
        }

        // Their filter check (only if they are Pro)
        if (otherUser.isPro && myGender !== "UNDISCLOSED") {
          // If they had set a filter, we'd check here — simplified since we dropped pref cache
        }

        // ✅ Real user match!
        roomId = randomUUID().slice(0, 12);
        await prisma.match.create({
          data: { initiatorId: uid, joinerId: other, mode, roomId },
        });
        await notifyPair(uid, other, roomId, false, false);
        
        partnerName = otherUser.sillyName ?? "Anonymous";
        partnerId = other;
        matchFound = true;
        break;
      }
    }

    // If no real user match found, try to find a guest
    if (!matchFound) {
      for (let i = 0; i < 10; i++) {
        const otherGuest = await redis.lpop("queue:guest");
        if (!otherGuest) break;

        // Check if the guest is still alive
        const alive = await redis.exists(`queue:guest:${otherGuest}`);
        if (!alive) continue;

        // Check if guest is still online
        const result = await redis.pipeline().exists(GUEST_PRESENCE(otherGuest)).exec();
        const live = result?.[0]?.[1];
        if (live !== 1) continue;

        // Found a guest match!
        roomId = `mixed_${randomUUID().slice(0, 12)}`;
        partnerName = "Anonymous Guest";
        partnerId = otherGuest;
        await notifyPair(uid, otherGuest, roomId, false, true);
        matchFound = true;
        break;
      }
    }

    if (matchFound) {
      return NextResponse.json({
        queued: false,
        roomId,
        partnerName,
        partnerId,
        isGuest: partnerName.includes("Guest")
      });
    }

    // No match found → enqueue self
    await redis.rpush("queue:random", uid);
    await redis.setex(`queue:random:user:${uid}`, QUEUE_TTL, "1");
    return NextResponse.json({ queued: true });
  }

  // -------------------
  // INTEREST MODE
  // -------------------
  if (mode === "interest") {
    // Load my interests from DB directly
    const myInterests = await prisma.interestOnUser.findMany({
      where: { userId: uid },
      include: { interest: true },
    });
    const tags = myInterests.map((i) => i.interest.name.toLowerCase());

    if (!tags.length) {
      return new NextResponse("no interests set", { status: 400 });
    }

    let bestCandidate: { uid: string; score: number; sillyName: string | null } | null = null;

    for (const tag of tags) {
      const qKey = `queue:interest:${tag}`;
      const candidate = await redis.lpop(qKey);
      if (!candidate) continue;

      const alive = await redis.exists(`${qKey}:user:${candidate}`);
      if (!alive) {
        // Stale candidate expired
        continue;
      }

      if (candidate === uid && !SELF_MATCH_DEV) continue;

      const result = await redis.pipeline().exists(PRESENCE(candidate)).exec();
      const live = result?.[0]?.[1];
      if (live !== 1) continue;

      // Candidate info from DB
      const [otherInterests, otherUser] = await Promise.all([
        prisma.interestOnUser.findMany({
          where: { userId: candidate },
          include: { interest: true },
        }),
        prisma.user.findUnique({
          where: { id: candidate },
          select: { gender: true, sillyName: true, isPro: true },
        }),
      ]);
      if (!otherUser) continue;

      const otherTags = new Set(otherInterests.map((i) => i.interest.name.toLowerCase()));
      const otherGender = normalizeGender(otherUser.gender);

      // My filter check
      if (myFilter !== "ANY" && otherGender !== myFilter) {
        await redis.rpush(qKey, candidate);
        continue;
      }

      // Their filter check (only if they are Pro)
      if (otherUser.isPro && myGender !== "UNDISCLOSED") {
        // Simplified, no pref cache
      }

      // Overlap score
      const overlap = tags.filter((t) => otherTags.has(t)).length;

      if (overlap > 0) {
        if (!bestCandidate || overlap > bestCandidate.score) {
          bestCandidate = {
            uid: candidate,
            score: overlap,
            sillyName: otherUser.sillyName ?? "Anonymous",
          };
        } else {
          await redis.rpush(qKey, candidate);
        }
      } else {
        await redis.rpush(qKey, candidate);
      }
    }

    if (bestCandidate) {
      const roomId = randomUUID().slice(0, 12);
      await prisma.match.create({
        data: { initiatorId: uid, joinerId: bestCandidate.uid, mode, roomId },
      });
      await notifyPair(uid, bestCandidate.uid, roomId);

      return NextResponse.json({
        queued: false,
        roomId,
        partnerName: bestCandidate.sillyName ?? "Anonymous",
        partnerId: bestCandidate.uid,
      });
    }

    // No match yet → enqueue self into all interest queues
    for (const tag of tags) {
      const qKey = `queue:interest:${tag}`;
      await redis.rpush(qKey, uid);
      await redis.setex(`${qKey}:user:${uid}`, QUEUE_TTL, "1");
    }
    return NextResponse.json({ queued: true });
  }

  return new NextResponse("not implemented", { status: 400 });
}
