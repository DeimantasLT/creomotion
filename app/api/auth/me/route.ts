import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Try to find user first
    let user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // If not found, try to find client
    let client = null;
    if (!user) {
      client = await prisma.client.findUnique({
        where: { id: payload.userId },
      });
    }

    if (!user && !client) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data
    const userData = user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    } : {
      id: client!.id,
      email: client!.email,
      name: client!.name,
      role: 'CLIENT',
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
