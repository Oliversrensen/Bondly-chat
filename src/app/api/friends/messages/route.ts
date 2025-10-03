import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends/messages?friendId=xxx - Get messages with a friend
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendUserId = searchParams.get("friendId");
    
    if (!friendUserId) {
      return NextResponse.json({ error: "Friend ID is required" }, { status: 400 });
    }

    // Verify friendship exists and is accepted
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, receiverId: friendUserId, status: "ACCEPTED" },
          { requesterId: friendUserId, receiverId: session.user.id, status: "ACCEPTED" }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    // Get messages
    const messages = await prisma.friendMessage.findMany({
      where: { friendId: friendship.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            sillyName: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching friend messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/friends/messages - Send message to friend
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId: friendUserId, text } = await request.json();
    
    if (!friendUserId || !text) {
      return NextResponse.json({ error: "Friend ID and text are required" }, { status: 400 });
    }

    if (text.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Verify friendship exists and is accepted
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, receiverId: friendUserId, status: "ACCEPTED" },
          { requesterId: friendUserId, receiverId: session.user.id, status: "ACCEPTED" }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    // Create message
    const message = await prisma.friendMessage.create({
      data: {
        authorId: session.user.id,
        friendId: friendship.id,
        text: text.trim()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            sillyName: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error sending friend message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
