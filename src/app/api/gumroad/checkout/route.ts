import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";

export async function POST(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  try {
    // Gumroad checkout URL with your product ID
    const productId = process.env.GUMROAD_PRODUCT_ID;
    if (!productId) {
      return new NextResponse("Gumroad product ID not configured", { status: 500 });
    }

    // Create Gumroad checkout URL with user email
    const userEmail = session.user?.email || '';
    const checkoutUrl = `https://gumroad.com/l/${productId}?wanted=true&email=${encodeURIComponent(userEmail)}&custom1=${uid}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Gumroad checkout error:", error);
    return new NextResponse("Checkout creation failed", { status: 500 });
  }
}
