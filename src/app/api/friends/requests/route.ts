import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends/requests - Get pending friend requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingRequests = await prisma.friend.findMany({
      where: {
        receiverId: session.user.id,
        status: "PENDING"
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
            generatedAvatar: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ requests: pendingRequests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/friends/requests - Accept or decline friend request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId, action } = await request.json();
    
    if (!friendId || !action) {
      return NextResponse.json({ error: "Friend ID and action are required" }, { status: 400 });
    }

    if (!["ACCEPT", "DECLINE"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Verify the request exists and user is the receiver
    const friendRequest = await prisma.friend.findFirst({
      where: {
        id: friendId,
        receiverId: session.user.id,
        status: "PENDING"
      }
    });

    if (!friendRequest) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
    }

    // Update the friend request status
    const updatedFriend = await prisma.friend.update({
      where: { id: friendId },
      data: {
        status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED"
      },
      include: {
        requester: {
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
      message: `Friend request ${action.toLowerCase()}ed`,
      friend: updatedFriend
    });
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
