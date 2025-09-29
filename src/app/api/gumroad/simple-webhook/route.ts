import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Gumroad sends form-encoded data, not JSON
    const formData = await req.formData();
    const data: any = {};
    
    // Convert form data to object
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    console.log("=== GUMROAD WEBHOOK DEBUG ===");
    console.log("Webhook received at:", new Date().toISOString());
    console.log("Raw form data entries:", Array.from(formData.entries()));
    console.log("Parsed data:", JSON.stringify(data, null, 2));
    console.log("Resource name:", data.resource_name);
    console.log("Product ID (short):", data.short_product_id);
    console.log("User ID (custom1):", data['url_params[custom1]']);
    console.log("Is test:", data.test);
    console.log("=============================");

    // Handle different event types based on resource_name
    switch (data.resource_name) {
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
        console.log("Unhandled Gumroad resource type:", data.resource_name);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Gumroad webhook error:", error);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}

async function handleSale(data: any) {
  console.log("=== HANDLING SALE ===");
  // User ID is in url_params[custom1]
  const userId = data['url_params[custom1]'];
  console.log("Extracted user ID:", userId);
  
  if (!userId) {
    console.error("❌ No user ID found in Gumroad sale data");
    console.error("Available data keys:", Object.keys(data));
    console.error("Full data:", data);
    return;
  }

  // Check if this is a subscription product using short_product_id
  const isSubscription = data.short_product_id === process.env.GUMROAD_PRODUCT_ID;
  console.log("Product ID from webhook:", data.short_product_id);
  console.log("Expected product ID:", process.env.GUMROAD_PRODUCT_ID);
  console.log("Is subscription product:", isSubscription);
  
  if (!isSubscription) {
    console.log("❌ Not a subscription product, skipping");
    return;
  }

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
  const userId = data['url_params[custom1]'];
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
  const userId = data['url_params[custom1]'];
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
