import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First try to find a USER
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let isClient = false;
    let client = null;

    // If no user found, try to find a CLIENT
    if (!user) {
      client = await prisma.client.findUnique({
        where: { email },
      });

      if (client) {
        isClient = true;
      }
    }

    // If neither found, invalid credentials
    if (!user && !client) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    let isPasswordValid = false;

    if (user) {
      isPasswordValid = await verifyPassword(password, user.passwordHash);
    } else if (client && client.passwordHash) {
      isPasswordValid = await verifyPassword(password, client.passwordHash);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
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

    // Set HTTP-only cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
