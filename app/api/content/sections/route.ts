import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/content/sections - Get all available section keys
export async function GET(request: NextRequest) {
  try {
    const sections = await prisma.contentSection.findMany({
      select: {
        key: true,
        type: true,
        updatedAt: true,
      },
      orderBy: {
        key: 'asc',
      },
    });

    // Format sections for easy frontend consumption
    const formattedSections = sections.map((section) => ({
      key: section.key,
      type: section.type,
      updatedAt: section.updatedAt.toISOString(),
    }));

    return NextResponse.json({ sections: formattedSections });
  } catch (error) {
    console.error('List sections error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
