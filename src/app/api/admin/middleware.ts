import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function adminAuthMiddleware(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // You can add additional authorization checks here
    // For example, check if user has admin role, specific permissions, etc.
    // For now, any authenticated user can access admin APIs
    
    return null; // Allow the request to continue
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
