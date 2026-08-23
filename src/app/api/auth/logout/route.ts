import { NextRequest, NextResponse } from 'next/server';
import { signOut as authSignOut } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Sign out current user
 */
export async function POST(request: NextRequest) {
  try {
    const { error } = await authSignOut();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Signed out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign out' },
      { status: 400 }
    );
  }
}
