import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, withRole } from '@/lib/auth';

// GET /api/invoices - List all invoices
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    // Build filter conditions
    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
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
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('List invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/invoices - Create new invoice
export const POST = withRole(['ADMIN', 'EDITOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { projectId, clientId, amount, status, invoiceNumber: providedInvoiceNumber, invoiceDate, dueDate, lineItems } = body;

    if (!projectId || !clientId || !amount) {
      return NextResponse.json(
        { error: 'projectId, clientId, and amount are required' },
        { status: 400 }
      );
    }

    // Generate invoice number atomically to prevent race conditions
    let finalInvoiceNumber = providedInvoiceNumber;
    if (!finalInvoiceNumber) {
      finalInvoiceNumber = await prisma.$transaction(async (tx) => {
        const settings = await tx.invoiceSettings.findFirst();
        const prefix = settings?.invoicePrefix || 'CM';
        const nextNum = settings?.nextInvoiceNumber || 1;

        // Find the highest existing invoice number with this prefix
        const existingInvoices = await tx.invoice.findMany({
          where: {
            invoiceNumber: {
              startsWith: prefix,
            },
          },
          select: {
            invoiceNumber: true,
          },
        });

        let maxNum = nextNum - 1;
        for (const inv of existingInvoices) {
          if (inv.invoiceNumber) {
            const match = inv.invoiceNumber.match(new RegExp(`^${prefix}-(\\d+)$`));
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        }

        const newNum = maxNum + 1;
        const generatedNumber = `${prefix}-${String(newNum).padStart(4, '0')}`;

        // Update settings with next number
        if (settings) {
          await tx.invoiceSettings.update({
            where: { id: settings.id },
            data: { nextInvoiceNumber: newNum + 1 },
          });
        }

        return generatedNumber;
      });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        projectId,
        clientId,
        invoiceNumber: finalInvoiceNumber,
        amount: parseFloat(amount.toString()),
        status: status || 'DRAFT',
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        lineItems: lineItems && lineItems.length > 0
          ? {
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

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
