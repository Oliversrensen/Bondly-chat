import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends - Get user's friends list
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { requesterId: session.user.id, status: "ACCEPTED" },
          { receiverId: session.user.id, status: "ACCEPTED" }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            sillyName: true,
            image: true,
            isPro: true,
            profilePicture: true,
            profilePictureType: true,
            generatedAvatar: true,
            selectedAvatarId: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            sillyName: true,
            image: true,
            isPro: true,
            profilePicture: true,
            profilePictureType: true,
            generatedAvatar: true,
            selectedAvatarId: true
          }
        }
      }
    });

    // Transform the data to show friend info regardless of who initiated
    const friendsList = friends.map(friend => ({
      id: friend.id,
      friend: friend.requesterId === session.user?.id ? friend.receiver : friend.requester,
      createdAt: friend.createdAt
    }));

    return NextResponse.json({ friends: friendsList });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot add yourself as a friend" }, { status: 400 });
    }

    // Check if friend request already exists
    const existingRequest = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, receiverId: userId },
          { requesterId: userId, receiverId: session.user.id }
        ]
      }
    });

    if (existingRequest) {
      return NextResponse.json({ error: "Friend request already exists" }, { status: 400 });
    }

    // Create friend request
    const friendRequest = await prisma.friend.create({
      data: {
        requesterId: session.user.id,
        receiverId: userId,
        status: "PENDING"
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            sillyName: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: "Friend request sent",
      friendRequest 
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
