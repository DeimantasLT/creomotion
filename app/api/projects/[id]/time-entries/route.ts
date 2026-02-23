import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';

// GET /api/projects/[id]/time-entries - Get time entries for a project
export const GET = withAuth(async (request: NextRequest, user, context: { params: any }) => {
  try {
    const params = await context.params;
    const projectId = params.id;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access: clients can only see their own projects
    if (user.role === 'CLIENT') {
      const client = await prisma.client.findFirst({
        where: { email: user.email },
      });
      if (!client || project.clientId !== client.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ timeEntries });
  } catch (error) {
    console.error('Get project time entries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
