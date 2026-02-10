import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';

// GET /api/clients/[id] - Get single client
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Get id from URL params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            _count: {
              select: {
                timeEntries: true,
                invoices: true,
              },
            },
          },
        },
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/clients/[id] - Update client
export const PUT = withRole(['ADMIN', 'EDITOR'], async (request: NextRequest, user) => {
  try {
    // Get id from URL params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const body = await request.json();
    const { name, email, company, phone } = body;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== existingClient.email.toLowerCase()) {
      const emailExists = await prisma.client.findFirst({
        where: { 
          email: email.toLowerCase(),
          id: { not: id }
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Another client with this email already exists' },
          { status: 409 }
        );
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(company !== undefined && { company }),
        ...(phone !== undefined && { phone }),
      },
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/[id] - Delete client
export const DELETE = withRole(['ADMIN'], async (request: NextRequest, user) => {
  try {
    // Get id from URL params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if client has projects
    if (existingClient._count.projects > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing projects. Please delete or reassign projects first.' },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
