'use client';

import { useEffect, useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDFDocument } from './InvoicePDFDocument';
import type { InvoiceWithRelations } from '@/hooks/useInvoices';
import type { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface InvoicePDFProps {
  invoice: InvoiceWithRelations;
  settings?: InvoiceSettings;
  showPreview?: boolean;
}

export default function InvoicePDF({ invoice, settings, showPreview = false }: InvoicePDFProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // For server-side rendering, don't render PDF
  if (!isClient) {
    return <div className="p-8 text-center">Loading PDF...</div>;
  }

  // Ensure settings has default values
  const mergedSettings = settings || {
    id: 'default',
    companyName: 'CREO MOTION',
    companyAddress: '',
    companyCity: '',
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
  };

  const filename = `Invoice-${invoice.id}.pdf`;

  if (showPreview) {
    return (
      <div className="w-full">
        <PDFViewer width="100%" height="600">
          <InvoicePDFDocument invoice={invoice} settings={mergedSettings} />
        </PDFViewer>
      </div>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument invoice={invoice} settings={mergedSettings} />}
      fileName={filename}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff006e] text-[#0a0a0a] rounded-lg font-bold text-sm hover:bg-[#ff1a7a] transition-colors"
    >
      {({ loading }) => (
        <>
          {loading ? 'Kuriamas PDF...' : 'Atsisiusti PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
}
