import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-full";

export async function POST(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user?.email) return new NextResponse("no email", { status: 400 });

  // Call Lemon Squeezy API to create checkout
  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            custom: { userId: uid },
          },
        },
        relationships: {
          store: { data: { type: "stores", id: process.env.LEMON_STORE_ID } },
          variant: { data: { type: "variants", id: process.env.LEMON_VARIANT_ID } },
        },
      },
    }),
  });

  const json = await res.json();
  const url = json?.data?.attributes?.url;

  return NextResponse.json({ url });
}
