import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

// Normalize & validate interest tags
function normalizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const cleaned = raw
    .map((x) => String(x).trim().toLowerCase())
    .filter((s) => s.length >= 2 && s.length <= 32)
    .map((s) => s.replace(/\s+/g, " ").replace(/[^a-z0-9\- ]/g, "")); // letters, numbers, space, hyphen
  return Array.from(new Set(cleaned)).slice(0, 50); // de-dupe + cap
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id || req.cookies.get("uid")?.value;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { interests: { include: { interest: true } } },
  });
  if (!user) return NextResponse.json({ id: uid, gender: "Undisclosed", interests: [] });

  const interests = user.interests.map((i) => i.interest.name);
  return NextResponse.json({
    id: user.id,
    gender: user.gender,
    interests,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id || req.cookies.get("uid")?.value;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const gender = typeof body.gender === "string" ? body.gender : undefined;
  const tags = normalizeTags(body.interests);

  // update gender if provided
  if (gender) {
    await prisma.user.upsert({
      where: { id: uid },
      update: { gender: gender as any },
      create: { id: uid, gender: gender as any },
    });
  }

  // sync interests if provided
  if (Array.isArray(body.interests)) {
    // 1) ensure Interest rows exist
    const interestRows = await Promise.all(
      tags.map((name) =>
        prisma.interest.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );
    const idsByName = new Map(interestRows.map((r) => [r.name, r.id]));

    // 2) get current user interests
    const current = await prisma.interestOnUser.findMany({
      where: { userId: uid },
      include: { interest: true },
    });
    const currentNames = new Set(current.map((c) => c.interest.name));

    // 3) determine adds/removes
    const toAdd = tags.filter((t) => !currentNames.has(t));
    const toRemove = [...currentNames].filter((t) => !tags.includes(t));

    // 4) apply DB changes
    if (toAdd.length) {
      await prisma.interestOnUser.createMany({
        data: toAdd.map((name) => ({
          userId: uid,
          interestId: idsByName.get(name)!,
          weight: 1,
        })),
        skipDuplicates: true,
      });
    }
    if (toRemove.length) {
      await prisma.interestOnUser.deleteMany({
        where: {
          userId: uid,
          interest: { name: { in: toRemove } },
        },
      });
    }

    // 5) mirror to Redis for matching
    const key = `user:interests:${uid}`;
    await redis.del(key);
    if (tags.length) await redis.sadd(key, ...tags);
  }

  // respond with fresh data
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { interests: { include: { interest: true } } },
  });
  return NextResponse.json({
    id: uid,
    gender: user?.gender ?? gender ?? "Undisclosed",
    interests: user?.interests.map((i) => i.interest.name) ?? tags,
  });
}
