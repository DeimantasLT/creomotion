import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/deliverables/[id]/versions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliverableId = params.id;
    
    const versions = await prisma.deliverableVersion.findMany({
      where: { deliverableId },
      orderBy: { versionNumber: 'desc' }
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

// POST /api/deliverables/[id]/versions
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
    const { fileUrl, thumbnailUrl, notes } = await request.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Get current deliverable to determine next version number
    const deliverable = await prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } }
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      );
    }

    const nextVersionNumber = deliverable.versions[0]?.versionNumber || deliverable.version || 0 + 1;

    // Create the new version
    const version = await prisma.deliverableVersion.create({
      data: {
        versionNumber: nextVersionNumber + 1,
        fileUrl,
        thumbnailUrl,
        notes,
        deliverableId,
        createdBy: session.user.id
      }
    });

    // Update the deliverable's main file and version
    await prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        fileUrl,
        thumbnailUrl,
        version: nextVersionNumber + 1
      }
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}
