import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("X-Signature");

  // Verify signature
  const expected = crypto
    .createHmac("sha256", process.env.LEMON_WEBHOOK_SECRET!)
    .update(raw)
    .digest("hex");

  if (sig !== expected) {
    return new NextResponse("invalid signature", { status: 400 });
  }

  const event = JSON.parse(raw);
  const type = event.meta.event_name;

  if (type === "subscription_created" || type === "subscription_updated") {
    const sub = event.data.attributes;
    const userId = sub.custom_data?.userId;
    if (!userId) return new NextResponse("missing userId", { status: 400 });

    await prisma.subscription.upsert({
      where: { id: event.data.id },
      update: {
        status: sub.status,
        currentPeriodEnd: new Date(sub.renews_at),
        priceId: sub.variant_id.toString(),
      },
      create: {
        id: event.data.id,
        userId,
        status: sub.status,
        currentPeriodEnd: new Date(sub.renews_at),
        priceId: sub.variant_id.toString(),
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isPro: sub.status === "active" },
    });
  }

  if (type === "subscription_cancelled") {
    const sub = event.data.attributes;
    const userId = sub.custom_data?.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isPro: false },
      });
    }
  }

  return new NextResponse("ok");
}
