import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';

// GET /api/content/[key] - Get content by key
export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ key: string }> }) => {
  try {
    const { key } = await params;
    
    const content = await prisma.contentSection.findUnique({
      where: { key },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/content/[key] - Update content by key
export const PUT = withRole(['ADMIN', 'EDITOR'], async (request: NextRequest, { params }: { params: Promise<{ key: string }> }) => {
  try {
    const { key } = await params;
    const body = await request.json();
    const { data, type } = body;

    const content = await prisma.contentSection.update({
      where: { key },
      data: {
        ...(data !== undefined && { data }),
        ...(type !== undefined && { type }),
      },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Update content error:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/content/[key] - Delete content by key
export const DELETE = withRole(['ADMIN'], async (request: NextRequest, { params }: { params: Promise<{ key: string }> }) => {
  try {
    const { key } = await params;

    await prisma.contentSection.delete({
      where: { key },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete content error:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
