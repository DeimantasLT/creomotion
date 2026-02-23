import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/deliverables/[id]/annotations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliverableId = params.id;
    
    const annotations = await prisma.annotation.findMany({
      where: { deliverableId },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({ annotations });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

// POST /api/deliverables/[id]/annotations
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
    const {
      type,
      color,
      coordinates,
      timestamp,
      comment
    } = await request.json();

    if (!type || !coordinates || timestamp === undefined) {
      return NextResponse.json(
        { error: 'Type, coordinates, and timestamp are required' },
        { status: 400 }
      );
    }

    const annotation = await prisma.annotation.create({
      data: {
        type,
        color: color || '#ff006e',
        coordinates,
        timestamp: parseFloat(timestamp),
        comment: comment || '',
        deliverableId,
        authorId: session.user.id
      }
    });

    return NextResponse.json({ annotation }, { status: 201 });
  } catch (error) {
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}
