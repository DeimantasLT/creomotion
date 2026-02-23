import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PATCH /api/deliverables/[id]/timeline-comments/[commentId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = params;
    const { resolved, content } = await request.json();

    const updateData: { resolved?: boolean; content?: string } = {};
    if (resolved !== undefined) updateData.resolved = resolved;
    if (content) updateData.content = content;

    const comment = await prisma.timelineComment.update({
      where: { id: commentId },
      data: updateData,
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error updating timeline comment:', error);
    return NextResponse.json(
      { error: 'Failed to update timeline comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/deliverables/[id]/timeline-comments/[commentId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = params;

    // First delete all replies
    await prisma.timelineComment.deleteMany({
      where: { parentId: commentId }
    });

    // Then delete the comment
    await prisma.timelineComment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete timeline comment' },
      { status: 500 }
    );
  }
}
