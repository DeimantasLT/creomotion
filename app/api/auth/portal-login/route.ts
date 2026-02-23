import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Try to find USER first
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If no user, try to find CLIENT
    let client = null;
    if (!user) {
      client = await prisma.client.findUnique({
        where: { email },
      });
    }

    // Reject if neither found
    if (!user && !client) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    let isPasswordValid = false;

    if (user) {
      // User found - check if role is CLIENT
      if (user.role !== 'CLIENT') {
        return NextResponse.json(
          { error: 'Access denied. Client access only.' },
          { status: 403 }
        );
      }
      isPasswordValid = await verifyPassword(password, user.passwordHash);
    } else if (client && client.passwordHash) {
      // Client found - verify password hash
      isPasswordValid = await verifyPassword(password, client.passwordHash);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const tokenData = user ? {
      userId: user.id,
      email: user.email,
      role: user.role,
    } : {
      userId: client!.id,
      email: client!.email,
      role: 'CLIENT' as const,
    };

    const token = generateToken(tokenData);

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

    const response = NextResponse.json({ user: userData });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Portal login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
