import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { randomUUID } from "crypto";

const GUEST_QUEUE_TTL = 300; // 5 minutes for guest queue
const GUEST_PRESENCE_TTL = 60; // 1 minute for guest presence

const GUEST_PRESENCE = (guestId: string) => `guest:presence:${guestId}`;
const GUEST_PENDING = (guestId: string) => `guest:match:pending:${guestId}`;

// Notify both guests of the match
async function notifyGuestPair(guestA: string, guestB: string, roomId: string) {
  try {
    await redis.set(GUEST_PENDING(guestA), roomId, "EX", 120);
    await redis.set(GUEST_PENDING(guestB), roomId, "EX", 120);
  } catch (err) {
    console.error("Failed to set pending for guest pair", err);
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

    // Try to find a match in the guest queue
    for (let i = 0; i < 20; i++) { // Check up to 20 potential matches
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

      // Found a match! Create room
      const roomId = `guest_${randomUUID().slice(0, 12)}`;
      await notifyGuestPair(guestId, otherGuest, roomId);

      return NextResponse.json({
        success: true,
        queued: false,
        roomId,
        partnerId: otherGuest,
        partnerName: "Anonymous Guest"
      });
    }

    // No match found, add to queue
    await redis.rpush("queue:guest", guestId);
    await redis.setex(`queue:guest:${guestId}`, GUEST_QUEUE_TTL, "1");

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
