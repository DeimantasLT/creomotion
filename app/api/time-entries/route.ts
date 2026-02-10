import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';

// GET /api/time-entries - List time entries with filtering
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const billable = searchParams.get('billable');

    // Build filter conditions
    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (billable !== null && billable !== undefined) {
      where.billable = billable === 'true';
    }

    // For non-admin users, only show their own time entries
    if (user.role === 'CLIENT') {
      // Clients see time entries for their projects only
      // This would require joining on projects they have access to
      // For now, return empty for clients
      return NextResponse.json({ timeEntries: [] });
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ timeEntries });
  } catch (error) {
    console.error('List time entries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/time-entries - Create new time entry
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { projectId, description, duration, date, billable, hourlyRate } = body;

    if (!projectId || !duration || !date) {
      return NextResponse.json(
        { error: 'projectId, duration, and date are required' },
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

    // Use current user ID from auth token
    const userId = user.userId;

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId,
        projectId,
        description,
        duration: parseInt(duration.toString()),
        date: new Date(date),
        billable: billable ?? true,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ timeEntry }, { status: 201 });
  } catch (error) {
    console.error('Create time entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
