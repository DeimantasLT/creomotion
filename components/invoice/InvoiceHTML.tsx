interface InvoiceHTMLProps {
  invoice: any;
  settings: any;
}

export function InvoiceHTMLContent({ invoice, settings }: InvoiceHTMLProps) {
  const isLT = settings?.defaultLanguage === 'lt';
  const t = {
    header: isLT ? 'SĄSKAITA FAKTŪRA' : 'INVOICE',
    from: isLT ? 'Pardavėjas' : 'From',
    to: isLT ? 'Pirkėjas' : 'Bill To',
    description: isLT ? 'Aprašymas' : 'Description',
    quantity: isLT ? 'Kiekis' : 'Qty',
    price: isLT ? 'Kaina' : 'Price',
    amount: isLT ? 'Suma' : 'Amount',
    subtotal: isLT ? 'Suma be PVM' : 'Subtotal',
    vat: isLT ? 'PVM' : 'VAT',
    total: isLT ? 'Viso' : 'Total',
    date: isLT ? 'Data' : 'Date',
    dueDate: isLT ? 'Mokėti iki' : 'Due Date',
    project: isLT ? 'Projektas' : 'Project',
    paymentDetails: isLT ? 'Mokėjimo informacija' : 'Payment Details',
    bank: isLT ? 'Bankas' : 'Bank',
    reference: isLT ? 'Paskirtis' : 'Reference',
    thankYou: isLT ? 'Ačiū už pasitikėjimą!' : 'Thank you!',
    regNo: isLT ? 'Įmonės kodas' : 'Business Reg.',
    vatCode: isLT ? 'PVM kodas' : 'VAT Code',
    invNo: 'Nr',
    status: isLT ? 'Statusas' : 'Status',
    company: isLT ? 'Įmonė' : 'Company',
    address: isLT ? 'Adresas' : 'Address',
    hours: isLT ? 'val.' : 'hrs',
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return isLT ? d.toLocaleDateString('lt-LT') : d.toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} EUR`;
  };

  const getInvoiceNumber = () => {
    const prefix = settings?.invoicePrefix || 'CM';
    const num = (settings?.nextInvoiceNumber || 1).toString().padStart(4, '0');
    return invoice?.invoiceNumber || `${prefix}-${num}`;
  };

  // Build seller name: personal name if available, else company name
  const sellerName = settings?.companyName || 'CREO MOTION';
  const sellerAddress = settings?.companyAddress;
  const sellerCity = settings?.companyCity;
  const sellerRegNo = settings?.companyCode;

  const subtotal = invoice?.lineItems?.reduce((sum: number, item: any) => sum + (item?.total || 0), 0) || invoice?.amount || 0;
  const vatRate = settings?.isVatPayer ? settings?.vatRate : 0;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  // Build line items from project tasks or use default
  const lineItems = invoice?.lineItems?.length > 0 
    ? invoice.lineItems 
    : [{
        description: invoice?.project?.name || t.description,
        quantity: 1,
        unitPrice: invoice?.amount || 0,
        total: invoice?.amount || 0,
      }];

  const statusColors: Record<string, string> = {
    DRAFT: '#9ca3af',
    SENT: '#3b82f6',
    PAID: '#22c55e',
    OVERDUE: '#ef4444',
  };

  // Client info from database
  const clientAddress = invoice?.client?.address || '';
  const clientCity = invoice?.client?.city || '';
  const clientCompanyCode = invoice?.client?.companyCode || '';
  const clientVatCode = invoice?.client?.vatCode || '';

  return `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${getInvoiceNumber()}</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        body {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 10pt;
          line-height: 1.5;
          color: #0a0a0a;
          background: white;
          padding: 20mm;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 35px;
          padding-bottom: 20px;
          border-bottom: 2px solid #0a0a0a;
        }
        
        .header-left {
          flex: 1;
        }
        
        .header-right {
          text-align: right;
        }
        
        .company-name {
          font-size: 26pt;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
          color: #0a0a0a;
        }

        .company-name-yellow {
          background: linear-gradient(135deg, #ffbe0b, #fb5607, #ff006e, #8338ec);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .company-tagline {
          font-size: 8pt;
          color: #ff006e;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 500;
        }
        
        .invoice-title {
          font-size: 28pt;
          font-weight: 700;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #0a0a0a;
        }
        
        .invoice-number {
          font-size: 11pt;
          font-weight: 500;
          margin-top: 8px;
          color: #666;
        }
        
        .status-badge {
          display: inline-block;
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 12px;
          border-radius: 4px;
          margin-top: 8px;
          color: white;
        }
        
        .columns {
          display: flex;
          gap: 40px;
          margin-bottom: 25px;
        }
        
        .column {
          flex: 1;
        }
        
        .column-label {
          font-size: 8pt;
          color: #ff006e;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .column-box {
          background: #f8f8f8;
          padding: 14px;
          border-radius: 6px;
          border: 1px solid #e5e5e5;
        }
        
        .company-name-card {
          font-size: 12pt;
          font-weight: 700;
          margin-bottom: 6px;
          color: #0a0a0a;
        }
        
        .text-muted {
          font-size: 9pt;
          color: #555;
          margin-bottom: 3px;
        }
        
        .info-row {
          display: flex;
          gap: 30px;
          margin-bottom: 25px;
          background: #fafafa;
          padding: 14px;
          border-radius: 6px;
          border: 1px solid #e5e5e5;
        }
        
        .info-item {
          flex: 1;
        }
        
        .info-label {
          font-size: 7pt;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 3px;
          font-weight: 500;
        }
        
        .info-value {
          font-size: 10pt;
          font-weight: 600;
          color: #0a0a0a;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        
        th {
          background: #0a0a0a;
          color: white;
          padding: 12px 10px;
          text-align: left;
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        th.text-right {
          text-align: right;
        }
        
        td {
          padding: 12px 10px;
          border-bottom: 1px solid #e5e5e5;
          font-size: 9.5pt;
          color: #0a0a0a;
        }
        
        tr:nth-child(even) {
          background: #fafafa;
        }
        
        td.text-right {
          text-align: right;
          font-family: 'JetBrains Mono', 'Consolas', monospace;
          font-feature-settings: 'tnum';
          font-variant-numeric: tabular-nums;
        }
        
        .totals {
          margin-left: auto;
          width: 280px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 9.5pt;
        }
        
        .grand-total {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 2px solid #0a0a0a;
          margin-top: 12px;
        }
        
        .grand-total-label {
          font-size: 13pt;
          font-weight: 700;
        }
        
        .grand-total-value {
          font-size: 15pt;
          font-weight: 700;
          color: #ff006e;
          font-family: 'JetBrains Mono', 'Consolas', monospace;
          font-feature-settings: 'tnum';
        }
        
        .bank-section {
          margin-top: 30px;
          padding: 16px;
          background: #f8f8f8;
          border-left: 3px solid #ff006e;
          border-radius: 0 6px 6px 0;
        }
        
        .bank-title {
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          color: #ff006e;
        }
        
        .bank-row {
          display: flex;
          margin-bottom: 4px;
        }
        
        .bank-label {
          width: 120px;
          font-size: 8.5pt;
          color: #666;
        }
        
        .bank-value {
          flex: 1;
          font-size: 9pt;
          font-weight: 600;
          font-family: 'JetBrains Mono', 'Consolas', monospace;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 15px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          justify-content: space-between;
          font-size: 8pt;
          color: #666;
        }
        
        @media print {
          body {
            padding: 20mm;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .column-box,
          .info-row,
          .bank-section,
          tr:nth-child(even) {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <div class="company-name">CREO<span class="company-name-yellow">MOTION</span></div>
        </div>
        <div class="header-right">
          <div class="invoice-title">${t.header}</div>
          <div class="invoice-number">${t.invNo}: ${getInvoiceNumber()}</div>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <div class="column-label">${t.from}</div>
          <div class="column-box">
            <div class="company-name-card">${settings?.companyName || ''}</div>
            ${settings?.companyAddress ? `<div class="text-muted">${settings.companyAddress}</div>` : ''}
            ${settings?.companyCity ? `<div class="text-muted">${settings.companyCity}${settings?.companyCountry ? ', ' + settings.companyCountry : ''}</div>` : ''}
            ${settings?.companyCode ? `<div class="text-muted">${t.regNo}: ${settings.companyCode}</div>` : ''}
            ${settings?.vatNumber ? `<div class="text-muted">${t.vatCode}: ${settings.vatNumber}</div>` : ''}
            ${settings?.email ? `<div class="text-muted">${settings.email}</div>` : ''}
            ${settings?.phone ? `<div class="text-muted">${settings.phone}</div>` : ''}
          </div>
        </div>
        <div class="column">
          <div class="column-label">${t.to}</div>
          <div class="column-box">
            <div class="company-name-card">${invoice?.client?.name || '-'}</div>
            ${invoice?.client?.company ? `<div class="text-muted"><strong>${t.company}:</strong> ${invoice.client.company}</div>` : ''}
            ${clientAddress ? `<div class="text-muted"><strong>${t.address}:</strong> ${clientAddress}${clientCity ? ', ' + clientCity : ''}</div>` : ''}
            ${clientCompanyCode ? `<div class="text-muted"><strong>${t.regNo}:</strong> ${clientCompanyCode}</div>` : ''}
            ${clientVatCode ? `<div class="text-muted"><strong>${t.vatCode}:</strong> ${clientVatCode}</div>` : ''}
            ${invoice?.client?.email ? `<div class="text-muted">${invoice.client.email}</div>` : ''}
            ${invoice?.client?.phone ? `<div class="text-muted">${invoice.client.phone}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-item">
          <div class="info-label">${t.date}</div>
          <div class="info-value">${formatDate(invoice?.invoiceDate || invoice?.createdAt)}</div>
        </div>
        ${invoice?.dueDate ? `
        <div class="info-item">
          <div class="info-label">${t.dueDate}</div>
          <div class="info-value">${formatDate(invoice.dueDate)}</div>
        </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">${t.project}</div>
          <div class="info-value">${invoice?.project?.name || '-'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>${t.description}</th>
            <th class="text-right">${t.quantity}</th>
            <th class="text-right">${t.price}</th>
            <th class="text-right">${t.amount}</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>${t.subtotal}</span>
          <span style="font-family: 'JetBrains Mono', monospace">${formatCurrency(subtotal)}</span>
        </div>
        ${settings?.isVatPayer ? `
          <div class="total-row">
            <span>${t.vat} (${settings.vatRate}%)</span>
            <span style="font-family: 'JetBrains Mono', monospace">${formatCurrency(vatAmount)}</span>
          </div>
        ` : ''}
        <div class="grand-total">
          <span class="grand-total-label">${t.total}</span>
          <span class="grand-total-value">${formatCurrency(total)}</span>
        </div>
      </div>

      ${(settings?.bankName || settings?.bankIban) ? `
        <div class="bank-section">
          <div class="bank-title">${t.paymentDetails}</div>
          ${settings?.bankName ? `
            <div class="bank-row">
              <div class="bank-label">${t.bank}:</div>
              <div class="bank-value">${settings.bankName}</div>
            </div>` : ''}
          ${settings?.bankIban ? `
            <div class="bank-row">
              <div class="bank-label">IBAN:</div>
              <div class="bank-value">${settings.bankIban}</div>
            </div>` : ''}
          ${settings?.bankSwift ? `
            <div class="bank-row">
              <div class="bank-label">SWIFT:</div>
              <div class="bank-value">${settings.bankSwift}</div>
            </div>` : ''}
          <div class="bank-row">
            <div class="bank-label">${t.reference}:</div>
            <div class="bank-value">${getInvoiceNumber()}</div>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <span>${t.thankYou}</span>
        <span>${settings?.website || settings?.email || 'creomotion.lt'}</span>
      </div>
    </body>
    </html>
  `;
}
