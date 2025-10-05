import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // Check if user is Pro
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true }
  });

  if (!user?.isPro) {
    return new NextResponse("Pro membership required", { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new NextResponse("File must be an image", { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse("File size must be less than 5MB", { status: 400 });
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user's profile picture
    await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: dataUrl,
        profilePictureType: 'uploaded'
      }
    });

    return NextResponse.json({ 
      success: true,
      profilePicture: dataUrl,
      message: "Profile picture updated successfully"
    });

  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Remove profile picture and reset to generated avatar
    await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: null,
        profilePictureType: null
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Profile picture removed successfully"
    });

  } catch (error) {
    console.error("Error removing profile picture:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}