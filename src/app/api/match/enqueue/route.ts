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

// Notify both users of the match
async function notifyPair(uidA: string, uidB: string, roomId: string) {
  console.log("notifyPair", uidA, uidB, "->", roomId);
  try {
    await redis.set(PENDING(uidA), roomId, "EX", 120);
  } catch (err) {
    console.error("Failed to set pending for", uidA, err);
  }
  try {
    await redis.set(PENDING(uidB), roomId, "EX", 120);
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

  console.log("ENQUEUE", uid, "mode:", mode, "myGender:", myGender, "myFilter:", myFilter);

  // Set presence TTL
  const presenceTtl = Number(process.env.PRESENCE_TTL ?? 90);
  await redis.set(PRESENCE(uid), "1", "EX", presenceTtl);

  // -------------------
  // RANDOM MODE
  // -------------------
  if (mode === "random") {
    for (let i = 0; i < 50; i++) {
      const other = await redis.lpop("queue:random");
      if (!other) break;

      const alive = await redis.exists(`queue:random:user:${other}`);
      if (!alive) {
        console.log("Stale candidate", other, "expired TTL");
        continue;
      }

      if (other === uid && !SELF_MATCH_DEV) {
        console.log("Skip self popped entry");
        continue;
      }

      const [[, live]] = await redis.pipeline().exists(PRESENCE(other)).exec();
      if (live !== 1) {
        console.log("Candidate offline", other);
        continue;
      }

      // Candidate info from DB
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
        // If they had set a filter, we’d check here — simplified since we dropped pref cache
      }

      // ✅ Match!
      const roomId = randomUUID().slice(0, 12);
      await prisma.match.create({
        data: { initiatorId: uid, joinerId: other, mode, roomId },
      });
      await notifyPair(uid, other, roomId);

      return NextResponse.json({
        queued: false,
        roomId,
        partnerName: otherUser.sillyName ?? "Anonymous",
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
        console.log("Stale candidate", candidate, "expired TTL");
        continue;
      }

      if (candidate === uid && !SELF_MATCH_DEV) continue;

      const [[, live]] = await redis.pipeline().exists(PRESENCE(candidate)).exec();
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
