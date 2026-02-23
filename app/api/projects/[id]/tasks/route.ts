import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get all tasks for a project
export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const params = await context.params;
    const projectId = params.id;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { timeEntries: true }
        },
        timeEntries: {
          select: {
            duration: true,
            billable: true,
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Calculate actual hours from time entries
    const tasksWithHours = tasks.map(task => {
      const actualSeconds = task.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const actualHours = Math.round((actualSeconds / 3600) * 10) / 10;
      const billableSeconds = task.timeEntries
        .filter(e => e.billable)
        .reduce((sum, entry) => sum + entry.duration, 0);
      const billableHours = Math.round((billableSeconds / 3600) * 10) / 10;
      
      return {
        ...task,
        actualHours,
        billableHours,
        timeEntries: undefined, // Remove raw entries
      };
    });

    return NextResponse.json({ tasks: tasksWithHours });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// Create a new task
export async function POST(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const params = await context.params;
    const projectId = params.id;
    const body = await request.json();
    
    const { name, description, category, estimatedHours, order } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Task name is required' },
        { status: 400 }
      );
    }

    // Get current max order if not provided
    let taskOrder = order;
    if (taskOrder === undefined) {
      const lastTask = await prisma.task.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' },
      });
      taskOrder = (lastTask?.order ?? -1) + 1;
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        projectId,
        category: category || 'OTHER',
        estimatedHours: estimatedHours || null,
        order: taskOrder,
        status: 'TODO',
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
