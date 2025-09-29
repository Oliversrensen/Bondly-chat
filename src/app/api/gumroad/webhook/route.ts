import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-gumroad-signature");
    
    // Verify webhook signature
    if (process.env.GUMROAD_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.GUMROAD_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");
      
      if (signature !== expectedSignature) {
        console.error("Invalid Gumroad webhook signature");
        return new NextResponse("Invalid signature", { status: 400 });
      }
    }

    const data = JSON.parse(body);
    console.log("Gumroad webhook received:", data);

    // Handle different event types
    switch (data.event_type) {
      case "sale":
        await handleSale(data);
        break;
      case "refund":
        await handleRefund(data);
        break;
      case "dispute":
        await handleDispute(data);
        break;
      default:
        console.log("Unhandled Gumroad event type:", data.event_type);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Gumroad webhook error:", error);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}

async function handleSale(data: any) {
  const userId = data.custom_fields?.custom1 || data.custom_fields?.user_id;
  if (!userId) {
    console.error("No user ID found in Gumroad sale data");
    return;
  }

  // Check if this is a subscription product
  const isSubscription = data.product_id === process.env.GUMROAD_PRODUCT_ID;
  if (!isSubscription) return;

  try {
    // Update user to Pro status
    await prisma.user.update({
      where: { id: userId },
      data: { isPro: true },
    });

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { id: data.sale_id },
      update: {
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        priceId: data.product_id,
      },
      create: {
        id: data.sale_id,
        userId,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priceId: data.product_id,
      },
    });

    console.log(`User ${userId} upgraded to Pro via Gumroad`);
  } catch (error) {
    console.error("Error processing Gumroad sale:", error);
  }
}

async function handleRefund(data: any) {
  const userId = data.custom_fields?.custom1 || data.custom_fields?.user_id;
  if (!userId) return;

  try {
    // Remove Pro status
    await prisma.user.update({
      where: { id: userId },
      data: { isPro: false },
    });

    // Update subscription status
    await prisma.subscription.updateMany({
      where: { userId, priceId: data.product_id },
      data: { status: "cancelled" },
    });

    console.log(`User ${userId} Pro status removed due to refund`);
  } catch (error) {
    console.error("Error processing Gumroad refund:", error);
  }
}

async function handleDispute(data: any) {
  const userId = data.custom_fields?.custom1 || data.custom_fields?.user_id;
  if (!userId) return;

  try {
    // Remove Pro status for disputes
    await prisma.user.update({
      where: { id: userId },
      data: { isPro: false },
    });

    console.log(`User ${userId} Pro status removed due to dispute`);
  } catch (error) {
    console.error("Error processing Gumroad dispute:", error);
  }
}
