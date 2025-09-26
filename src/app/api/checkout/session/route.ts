
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const priceId = process.env.STRIPE_PRICE_ID!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro`
  });
  return NextResponse.json({ url: session.url });
}
