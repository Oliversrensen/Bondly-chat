import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAvatarData } from '@/lib/avatarGenerator';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is pro
    if (!user.isPro) {
      return NextResponse.json({ 
        error: 'Profile picture upload is only available for pro users' 
      }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Convert to base64 for storage (in production, you'd upload to cloud storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user's profile picture
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profilePicture: dataUrl,
        profilePictureType: 'uploaded'
      }
    });

    return NextResponse.json({ 
      success: true, 
      profilePicture: dataUrl 
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a new random avatar for the user
    const generatedAvatar = generateAvatarData();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profilePicture: null,
        profilePictureType: 'generated',
        generatedAvatar
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Profile picture delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
