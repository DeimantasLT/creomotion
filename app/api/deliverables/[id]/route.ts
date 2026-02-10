import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { DeliverableStatus } from '@prisma/client';

// GET /api/deliverables/[id] - Get single deliverable
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const { id } = await params;

      const deliverable = await prisma.deliverable.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              clientId: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!deliverable) {
        return NextResponse.json(
          { error: 'Deliverable not found' },
          { status: 404 }
        );
      }

      // If client, verify they own this deliverable's project
      if (user.role === 'CLIENT') {
        // Get client record for this user
        const client = await prisma.client.findFirst({
          where: { email: user.email },
        });

        if (!client || deliverable.project.clientId !== client.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      return NextResponse.json({ deliverable });
    } catch (error) {
      console.error('Get deliverable error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT /api/deliverables/[id] - Update deliverable
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const { status, comment } = body;

      // Check if deliverable exists
      const existingDeliverable = await prisma.deliverable.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              clientId: true,
            },
          },
        },
      });

      if (!existingDeliverable) {
        return NextResponse.json(
          { error: 'Deliverable not found' },
          { status: 404 }
        );
      }

      // Role-based permission checks
      if (user.role === 'CLIENT') {
        // Get client record for this user
        const client = await prisma.client.findFirst({
          where: { email: user.email },
        });

        if (!client || existingDeliverable.project.clientId !== client.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Clients can only update status to APPROVED or REJECTED
        if (status && !['APPROVED', 'REJECTED'].includes(status)) {
          return NextResponse.json(
            { error: 'Clients can only approve or request changes' },
            { status: 403 }
          );
        }
      }

      // Validate status if provided
      if (status && !Object.values(DeliverableStatus).includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }

      // Build update data
      const updateData: any = {};
      if (status) updateData.status = status;
      if (comment) updateData.description = existingDeliverable.description 
        ? `${existingDeliverable.description}\n\n[Comment ${new Date().toLocaleString()}]: ${comment}`
        : `[Comment ${new Date().toLocaleString()}]: ${comment}`;

      const deliverable = await prisma.deliverable.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              clientId: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Log notification (for now just console.log)
      if (status === 'APPROVED') {
        console.log(`📧 [NOTIFICATION] Deliverable "${deliverable.name}" approved by ${user.email}`);
      } else if (status === 'REJECTED') {
        console.log(`📧 [NOTIFICATION] Changes requested for "${deliverable.name}" by ${user.email}${comment ? `: "${comment}"` : ''}`);
      }

      return NextResponse.json({ deliverable });
    } catch (error) {
      console.error('Update deliverable error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE /api/deliverables/[id] - Delete deliverable (admin/editor only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const { id } = await params;

      // Only admin and editor can delete deliverables
      if (user.role === 'CLIENT') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Check if deliverable exists
      const existingDeliverable = await prisma.deliverable.findUnique({
        where: { id },
      });

      if (!existingDeliverable) {
        return NextResponse.json(
          { error: 'Deliverable not found' },
          { status: 404 }
        );
      }

      await prisma.deliverable.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Delete deliverable error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
