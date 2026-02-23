import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole, hashPassword } from '@/lib/auth';
import { validateBody, createClientSchema } from '@/lib/validation';

// GET /api/clients - List all clients
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('List clients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/clients - Create new client
export const POST = withRole(['ADMIN', 'EDITOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validation = validateBody(createClientSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, email, company, phone, address, notes, password } = validation.data;

    const existingClient = await prisma.client.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 409 }
      );
    }

    let passwordHash = null;
    if (password && password.trim()) {
      passwordHash = await hashPassword(password.trim());
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email.toLowerCase(),
        company,
        phone,
        address,
        passwordHash,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
