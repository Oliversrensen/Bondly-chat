import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Generate a unique guest session ID
    const guestId = `guest_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const sessionData = {
      guestId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
      messageCount: 0,
      isGuest: true
    };

    const response = NextResponse.json({ 
      success: true, 
      guestId,
      expiresAt: sessionData.expiresAt 
    });

    // Set guest session cookie (30 minutes)
    response.cookies.set('guest-session', JSON.stringify(sessionData), {
      maxAge: 30 * 60, // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error creating guest session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create guest session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const guestSessionCookie = req.cookies.get('guest-session');
    
    if (!guestSessionCookie) {
      return NextResponse.json({ 
        success: false, 
        error: 'No guest session found' 
      });
    }

    const sessionData = JSON.parse(guestSessionCookie.value);
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Guest session expired' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      session: sessionData 
    });
  } catch (error) {
    console.error('Error validating guest session:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid guest session' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the guest session cookie
    response.cookies.set('guest-session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error clearing guest session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear guest session' },
      { status: 500 }
    );
  }
}
