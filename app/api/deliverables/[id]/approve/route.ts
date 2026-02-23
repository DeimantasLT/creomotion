import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/deliverables/[id]/approve
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
    const { notes, versionId } = await request.json();

    // Get current version
    const deliverable = await prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      );
    }

    const currentVersionId = versionId || deliverable.versions[0]?.id || null;

    const isClient = session.user.role === 'CLIENT';
    const approverId = session.user.id;
    const approverType = isClient ? 'CLIENT' : 'USER';

    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        status: 'APPROVED',
        notes: notes || '',
        versionId: currentVersionId,
        deliverableId,
        approverId,
        approverType
      }
    });

    // Update deliverable status
    await prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: 'APPROVED' }
    });

    return NextResponse.json({ approval, status: 'APPROVED' });
  } catch (error) {
    console.error('Error approving deliverable:', error);
    return NextResponse.json(
      { error: 'Failed to approve deliverable' },
      { status: 500 }
    );
  }
}
