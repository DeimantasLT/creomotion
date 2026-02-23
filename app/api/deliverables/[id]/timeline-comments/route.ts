import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/deliverables/[id]/timeline-comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliverableId = params.id;
    
    const comments = await prisma.timelineComment.findMany({
      where: { 
        deliverableId,
        parentId: null // Only get top-level comments
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching timeline comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline comments' },
      { status: 500 }
    );
  }
}

// POST /api/deliverables/[id]/timeline-comments
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deliverableId = params.id;
    const { content, timestamp, parentId } = await request.json();

    if (!content || timestamp === undefined) {
      return NextResponse.json(
        { error: 'Content and timestamp are required' },
        { status: 400 }
      );
    }

    // Determine author type and ID
    const isClient = session.user.role === 'CLIENT';
    const authorId = session.user.id;
    const authorType = isClient ? 'CLIENT' : 'USER';

    const comment = await prisma.timelineComment.create({
      data: {
        content,
        timestamp: parseFloat(timestamp),
        deliverableId,
        authorId,
        authorType,
        parentId: parentId || null
      },
      include: {
        replies: true
      }
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating timeline comment:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline comment' },
      { status: 500 }
    );
  }
}
