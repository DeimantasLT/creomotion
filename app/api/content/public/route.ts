import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/content/public - Public content for landing page (no auth required)
export async function GET() {
  try {
    const sections = await prisma.contentSection.findMany({
      orderBy: { key: 'asc' },
    });

    // Transform to key-value object
    const content = sections.reduce((acc, section) => {
      acc[section.key] = {
        type: section.type,
        data: section.data,
      };
      return acc;
    }, {} as Record<string, { type: string; data: unknown }>);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Public content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
