import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';

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
    const { name, email, company, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if client with email already exists
    const existingClient = await prisma.client.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 409 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email.toLowerCase(),
        company,
        phone,
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
