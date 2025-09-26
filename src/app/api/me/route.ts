import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth-full";

export const runtime = "nodejs";

// 🔧 normalize tags: lowercase, 2–32 chars, only [a-z0-9 -], unique, max 50
function normalizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const cleaned = raw
    .map((x) => String(x).trim().toLowerCase())
    .filter((s) => s.length >= 2 && s.length <= 32)
    .map((s) => s.replace(/\s+/g, " ").replace(/[^a-z0-9 -]/g, ""));
  return Array.from(new Set(cleaned)).slice(0, 50);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id || req.cookies.get("uid")?.value;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true,
      sillyName: true,
      gender: true,
      isPro: true,
      interests: { include: { interest: true } },
    },
  });

  if (!user) {
    return NextResponse.json({
      id: uid,
      sillyName: `User${uid.slice(0, 6)}`,
      gender: "Undisclosed",
      interests: [],
      isPro: false,
    });
  }

  const interests = user.interests.map((i) => i.interest.name);
  return NextResponse.json({
    id: user.id,
    sillyName: user.sillyName,
    gender: user.gender,
    interests,
    isPro: user.isPro,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id || req.cookies.get("uid")?.value;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const gender = typeof body.gender === "string" ? body.gender : undefined;
  const tags = normalizeTags(body.interests); // ✅ normalize always
  const sillyName = typeof body.sillyName === "string" ? body.sillyName : undefined;

  const me = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, isPro: true },
  });
  if (!me) return new NextResponse("not found", { status: 404 });

  if (sillyName && !me.isPro) {
    return new NextResponse("Upgrade to Pro to change your display name", {
      status: 403,
    });
  }

  // Upsert gender + base user
  if (gender) {
    await prisma.user.upsert({
      where: { id: uid },
      update: { gender: gender as any },
      create: { id: uid, sillyName: `User${uid.slice(0, 6)}`, gender: gender as any },
    });
  }

  // Update sillyName only if Pro
  if (sillyName && me.isPro) {
    await prisma.user.update({
      where: { id: uid },
      data: { sillyName },
    });
  }

  // Update interests
  if (Array.isArray(body.interests)) {
    const interestRows = await Promise.all(
      tags.map((name) =>
        prisma.interest.upsert({ where: { name }, update: {}, create: { name } })
      )
    );
    const idsByName = new Map(interestRows.map((r) => [r.name, r.id]));

    const current = await prisma.interestOnUser.findMany({
      where: { userId: uid },
      include: { interest: true },
    });
    const currentNames = new Set(current.map((c) => c.interest.name));

    const toAdd = tags.filter((t) => !currentNames.has(t));
    const toRemove = [...currentNames].filter((t) => !tags.includes(t));

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
        where: { userId: uid, interest: { name: { in: toRemove } } },
      });
    }

    // Refresh Redis cache
    const key = `user:interests:${uid}`;
    await redis.del(key);
    if (tags.length) {
      await redis.sadd(key, ...tags);
      await redis.expire(key, 86400); // ⏳ expire in 24h
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true,
      sillyName: true,
      gender: true,
      isPro: true,
      interests: { include: { interest: true } },
    },
  });

  return NextResponse.json({
    id: uid,
    sillyName: user?.sillyName ?? `User${uid.slice(0, 6)}`,
    gender: user?.gender ?? gender ?? "Undisclosed",
    interests: user?.interests.map((i) => i.interest.name) ?? tags,
    isPro: user?.isPro ?? false,
  });
}
