import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { DeliverableStatus } from '@prisma/client';

// GET /api/deliverables - List deliverables
// Query params: projectId, clientId
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const clientId = searchParams.get('clientId');

    // Build the where clause
    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    // If filtering by clientId, we need to join through projects
    if (clientId) {
      where.project = {
        clientId: clientId,
      };
    }

    const deliverables = await prisma.deliverable.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientId: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ deliverables });
  } catch (error) {
    console.error('List deliverables error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/deliverables - Create new deliverable (admin/editor only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Only admin and editor can create deliverables
    if (user.role === 'CLIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      projectId,
      fileUrl,
      thumbnailUrl,
      fileSize,
      mimeType,
      googleDriveId,
    } = body;

    if (!name || !projectId) {
      return NextResponse.json(
        { error: 'Name and projectId are required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Find the latest version for this deliverable name in the project
    const existingDeliverables = await prisma.deliverable.findMany({
      where: {
        projectId,
        name,
      },
      orderBy: {
        version: 'desc',
      },
      take: 1,
    });

    const version = existingDeliverables.length > 0 ? existingDeliverables[0].version + 1 : 1;

    const deliverable = await prisma.deliverable.create({
      data: {
        name,
        description,
        projectId,
        status: 'DRAFT',
        version,
        fileUrl,
        thumbnailUrl,
        fileSize,
        mimeType,
        googleDriveId,
      },
    });

    return NextResponse.json({ deliverable }, { status: 201 });
  } catch (error) {
    console.error('Create deliverable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
