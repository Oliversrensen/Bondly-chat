import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAvatarPresetById } from '@/lib/avatarGenerator';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatarId } = await request.json();

    if (!avatarId) {
      return NextResponse.json({ error: 'Avatar ID is required' }, { status: 400 });
    }

    // Validate that the avatar preset exists
    const preset = getAvatarPresetById(avatarId);
    if (!preset) {
      return NextResponse.json({ error: 'Invalid avatar ID' }, { status: 400 });
    }

    // Update user's selected avatar
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        selectedAvatarId: avatarId,
        profilePictureType: 'generated' // Ensure it's set to generated
      }
    });

    return NextResponse.json({ 
      success: true, 
      avatarId,
      avatarName: preset.name
    });

  } catch (error) {
    console.error('Avatar selection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
