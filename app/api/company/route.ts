import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

// Get company settings for invoices
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch from database/settings
    // For now return static company info
    const companyInfo = {
      name: process.env.COMPANY_NAME || 'CREO MOTION',
      address: process.env.COMPANY_ADDRESS || '123 Design Street',
      city: process.env.COMPANY_CITY || 'Vilnius',
      country: process.env.COMPANY_COUNTRY || 'Lithuania',
      vatNumber: process.env.COMPANY_VAT || 'LT123456789',
      companyCode: process.env.COMPANY_CODE || '123456789',
      email: process.env.COMPANY_EMAIL || 'invoice@creomotion.lt',
      phone: process.env.COMPANY_PHONE || '+370 600 00000',
      website: process.env.COMPANY_WEBSITE || 'www.creomotion.lt',
    };

    return NextResponse.json({ company: companyInfo });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company info' },
      { status: 500 }
    );
  }
}

// Update company settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // TODO: Update database/settings
    // For now just return success
    return NextResponse.json({ 
      success: true,
      message: 'Company info updated'
    });
  } catch (error) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: 'Failed to update company info' },
      { status: 500 }
    );
  }
}
