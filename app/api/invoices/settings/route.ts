import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let settings = await prisma.invoiceSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.invoiceSettings.create({
        data: {
          companyName: 'CREO MOTION',
          companyAddress: '123 Design Street',
          companyCity: 'Vilnius',
          companyCountry: 'Lithuania',
          companyCode: '',
          vatNumber: '',
          isVatPayer: false,
          vatRate: 21,
          email: 'invoice@creomotion.lt',
          phone: '',
          website: '',
          bankName: '',
          bankIban: '',
          bankSwift: '',
          invoicePrefix: 'CM',
          nextInvoiceNumber: 1,
          defaultLanguage: 'lt',
          defaultDueDays: 14,
          defaultNotes: '',
        },
      });
    }
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    console.log('Updating invoice settings with data:', data);
    
    // Validate required fields
    if (!data.companyName || !data.email) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, email' },
        { status: 400 }
      );
    }
    
    // Find existing settings or create new
    let settings = await prisma.invoiceSettings.findFirst();
    
    const cleanData = {
      companyName: data.companyName || 'CREO MOTION',
      companyAddress: data.companyAddress || '',
      companyCity: data.companyCity || '',
      companyCountry: data.companyCountry || 'Lithuania',
      companyCode: data.companyCode || '',
      vatNumber: data.vatNumber || '',
      isVatPayer: data.isVatPayer ?? false,
      vatRate: typeof data.vatRate === 'number' ? data.vatRate : 21,
      email: data.email || '',
      phone: data.phone || '',
      website: data.website || '',
      bankName: data.bankName || '',
      bankIban: data.bankIban || '',
      bankSwift: data.bankSwift || '',
      invoicePrefix: data.invoicePrefix || 'CM',
      nextInvoiceNumber: typeof data.nextInvoiceNumber === 'number' ? data.nextInvoiceNumber : 1,
      defaultLanguage: data.defaultLanguage || 'lt',
      defaultDueDays: typeof data.defaultDueDays === 'number' ? data.defaultDueDays : 14,
      defaultNotes: data.defaultNotes || '',
    };
    
    if (settings) {
      settings = await prisma.invoiceSettings.update({
        where: { id: settings.id },
        data: cleanData,
      });
    } else {
      settings = await prisma.invoiceSettings.create({
        data: cleanData,
      });
    }
    
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating invoice settings:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    return NextResponse.json(
      { error: 'Failed to update invoice settings', details: error.message },
      { status: 500 }
    );
  }
}
