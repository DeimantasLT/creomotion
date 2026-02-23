import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';
import { validateBody, createProjectSchema } from '@/lib/validation';

// GET /api/projects - List all projects with client
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const where: any = {};
    
    if (user.role === 'CLIENT') {
      const client = await prisma.client.findFirst({
        where: { email: user.email },
      });
      
      if (!client) {
        return NextResponse.json({ projects: [] });
      }
      
      where.clientId = client.id;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        _count: {
          select: {
            timeEntries: true,
            invoices: true,
            deliverables: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/projects - Create new project
export const POST = withRole(['ADMIN', 'EDITOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validation = validateBody(createProjectSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, description, clientId, status, budget, deadline } = validation.data;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientId,
        status: status || 'DRAFT',
        budget: budget || null,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
