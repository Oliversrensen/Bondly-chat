import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  
  if (!userId) {
    return new NextResponse("userId is required", { status: 400 });
  }

  try {
    // Check if user is online by checking Redis presence key
    const isOnline = await redis.exists(`presence:${userId}`);
    
    return NextResponse.json({ 
      isOnline: !!isOnline,
      userId 
    });
  } catch (error) {
    console.error("Error checking presence:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
