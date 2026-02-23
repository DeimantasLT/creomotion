import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, getAuthTokenFromRequest } from '@/lib/auth';

// PUT /api/invoices/[id] - Update full invoice
export async function PUT(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { clientId, projectId, amount, invoiceNumber, invoiceDate, dueDate, lineItems } = body;

    // Auth check
    const token = getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!['ADMIN', 'EDITOR'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update invoice with line items
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(clientId && { clientId }),
        ...(projectId && { projectId }),
        ...(amount && { amount: parseFloat(amount.toString()) }),
        ...(invoiceNumber && { invoiceNumber }),
        ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        lineItems: lineItems && lineItems.length > 0
          ? {
              deleteMany: {}, // Clear existing line items
              create: lineItems.map((item: any) => ({
                description: item.description,
                quantity: parseFloat(item.quantity.toString()),
                unitPrice: parseFloat(item.unitPrice.toString()),
                total: parseFloat(item.total.toString()),
              })),
            }
          : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            address: true,
            city: true,
            companyCode: true,
            vatCode: true,
            phone: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        lineItems: true,
      },
    });

    return NextResponse.json({ invoice }, { status: 200 });
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/invoices/[id] - Update invoice status
export async function PATCH(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    // Auth check
    const token = getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!['ADMIN', 'EDITOR'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update invoice status
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ invoice }, { status: 200 });
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  context: { params: any }
) {
  try {
    const { id } = await context.params;

    // Auth check
    const token = getAuthTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Delete invoice (cascade will delete line items)
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Invoice deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
