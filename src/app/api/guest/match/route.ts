import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const GUEST_QUEUE_TTL = 300; // 5 minutes for guest queue
const GUEST_PRESENCE_TTL = 60; // 1 minute for guest presence

const GUEST_PRESENCE = (guestId: string) => `guest:presence:${guestId}`;
const GUEST_PENDING = (guestId: string) => `guest:match:pending:${guestId}`;
const PRESENCE = (uid: string) => `presence:${uid}`;
const PENDING = (uid: string) => `match:pending:${uid}`;

// Notify both users of the match (handles guest + real user combinations)
async function notifyMatchPair(userA: string, userB: string, roomId: string, isGuestA: boolean, isGuestB: boolean) {
  try {
    // Set pending match for both users
    if (isGuestA) {
      await redis.set(GUEST_PENDING(userA), roomId, "EX", 120);
    } else {
      await redis.set(PENDING(userA), roomId, "EX", 120);
    }
    
    if (isGuestB) {
      await redis.set(GUEST_PENDING(userB), roomId, "EX", 120);
    } else {
      await redis.set(PENDING(userB), roomId, "EX", 120);
    }
  } catch (err) {
    console.error("Failed to set pending for match pair", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const guestSessionCookie = req.cookies.get('guest-session');
    
    if (!guestSessionCookie) {
      return NextResponse.json(
        { success: false, error: 'No guest session found' },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(guestSessionCookie.value);
    const guestId = sessionData.guestId;
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Guest session expired' },
        { status: 401 }
      );
    }

    // Set guest presence
    await redis.set(GUEST_PRESENCE(guestId), "1", "EX", GUEST_PRESENCE_TTL);

    // Try to find a match - check both guest queue AND real user queue
    let matchFound = false;
    let roomId = "";
    let partnerId = "";
    let partnerName = "Anonymous";

    // First, try to find another guest
    for (let i = 0; i < 10; i++) {
      const otherGuest = await redis.lpop("queue:guest");
      if (!otherGuest) break;

      // Check if the other guest is still alive
      const alive = await redis.exists(`queue:guest:${otherGuest}`);
      if (!alive) continue;

      // Don't match with yourself
      if (otherGuest === guestId) continue;

      // Check if other guest is still online
      const result = await redis.pipeline().exists(GUEST_PRESENCE(otherGuest)).exec();
      const live = result?.[0]?.[1];
      if (live !== 1) continue;

      // Found a guest match!
      roomId = `guest_${randomUUID().slice(0, 12)}`;
      partnerId = otherGuest;
      partnerName = "Anonymous Guest";
      await notifyMatchPair(guestId, otherGuest, roomId, true, true);
      matchFound = true;
      break;
    }

    // If no guest match found, try to find a real user
    if (!matchFound) {
      for (let i = 0; i < 20; i++) {
        const otherUser = await redis.lpop("queue:random");
        if (!otherUser) break;

        // Check if the other user is still alive
        const alive = await redis.exists(`queue:random:user:${otherUser}`);
        if (!alive) continue;

        // Check if other user is still online
        const result = await redis.pipeline().exists(PRESENCE(otherUser)).exec();
        const live = result?.[0]?.[1];
        if (live !== 1) continue;

        // Get real user info from database
        const otherUserData = await prisma.user.findUnique({
          where: { id: otherUser },
          select: { sillyName: true, name: true }
        });

        // Found a real user match!
        roomId = `mixed_${randomUUID().slice(0, 12)}`;
        partnerId = otherUser;
        partnerName = otherUserData?.sillyName || otherUserData?.name || "Anonymous";
        await notifyMatchPair(guestId, otherUser, roomId, true, false);
        matchFound = true;
        break;
      }
    }

    if (matchFound) {
      return NextResponse.json({
        success: true,
        queued: false,
        roomId,
        partnerId,
        partnerName,
        isRealUser: !partnerName.includes("Guest")
      });
    }

    // No match found, add to both queues to maximize chances
    await redis.rpush("queue:guest", guestId);
    await redis.setex(`queue:guest:${guestId}`, GUEST_QUEUE_TTL, "1");
    
    // Also add to regular queue for cross-matching
    await redis.rpush("queue:random", guestId);
    await redis.setex(`queue:random:user:${guestId}`, GUEST_QUEUE_TTL, "1");

    return NextResponse.json({
      success: true,
      queued: true,
      message: "Looking for someone to chat with..."
    });

  } catch (error) {
    console.error('Error in guest matching:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to find match' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const guestSessionCookie = req.cookies.get('guest-session');
    
    if (!guestSessionCookie) {
      return NextResponse.json(
        { success: false, error: 'No guest session found' },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(guestSessionCookie.value);
    const guestId = sessionData.guestId;
    
    // Check for pending match
    const roomId = await redis.get(GUEST_PENDING(guestId));
    
    if (!roomId) {
      return NextResponse.json({ 
        success: true, 
        roomId: null 
      });
    }

    return NextResponse.json({
      success: true,
      roomId,
      partnerId: null, // We don't know the partner ID for guests
      partnerName: "Anonymous Guest"
    });

  } catch (error) {
    console.error('Error checking guest match status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check match status' },
      { status: 500 }
    );
  }
}
