import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';

// GET /api/content - List all content sections
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const contentSections = await prisma.contentSection.findMany({
      orderBy: {
        key: 'asc',
      },
    });

    return NextResponse.json({ content: contentSections });
  } catch (error) {
    console.error('List content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/content - Create new content section
export const POST = withRole(['ADMIN', 'EDITOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { key, type, data } = body;

    if (!key || !type || data === undefined) {
      return NextResponse.json(
        { error: 'Key, type, and data are required' },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existing = await prisma.contentSection.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Content with this key already exists' },
        { status: 409 }
      );
    }

    const contentSection = await prisma.contentSection.create({
      data: {
        key,
        type,
        data,
        updatedBy: user.userId,
      },
    });

    return NextResponse.json({ content: contentSection }, { status: 201 });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
