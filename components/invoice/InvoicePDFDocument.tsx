'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { InvoiceWithRelations } from '@/hooks/useInvoices';
import type { InvoiceSettings } from '@/hooks/useInvoiceSettings';

// Register custom fonts - using Courier for Lithuanian support
Font.register({
  family: 'Courier',
});

interface InvoicePDFDocumentProps {
  invoice: InvoiceWithRelations;
  settings: InvoiceSettings;
}

// ASCII-safe translations (avoiding Lithuanian special chars in PDF)
const translations = {
  lt: {
    header: 'SASKAITA FAKTURA',
    from: 'PARDAVEJAS',
    to: 'PIRKEJAS',
    description: 'Aprasymas',
    quantity: 'Kiekis',
    price: 'Kaina',
    amount: 'Suma',
    subtotal: 'Suma be PVM',
    vat: 'PVM',
    total: 'VISO',
    date: 'Data',
    dueDate: 'Apmoketi iki',
    project: 'Projektas',
    paymentDetails: 'Mokejimo informacija',
    bank: 'Bankas',
    reference: 'Paskirtis',
    thankYou: 'Aciu uz pasitikejima!',
    regNo: 'Im.kodas',
    invNo: 'Saskaitos Nr',
    draft: 'PROJEKTAS',
    sent: 'ISSIUSTA',
    paid: 'APMOKETA',
  },
  en: {
    header: 'INVOICE',
    from: 'FROM',
    to: 'BILL TO',
    description: 'Description',
    quantity: 'Qty',
    price: 'Price',
    amount: 'Amount',
    subtotal: 'Subtotal',
    vat: 'VAT',
    total: 'TOTAL',
    date: 'Date',
    dueDate: 'Due Date',
    project: 'Project',
    paymentDetails: 'Payment Details',
    bank: 'Bank',
    reference: 'Reference',
    thankYou: 'Thank you for your business!',
    regNo: 'Reg. No',
    invNo: 'Invoice #',
    draft: 'DRAFT',
    sent: 'SENT',
    paid: 'PAID',
  },
};

export function InvoicePDFDocument({ invoice, settings }: InvoicePDFDocumentProps) {
  const isLT = settings.defaultLanguage === 'lt';
  const t = translations[isLT ? 'lt' : 'en'];

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString(isLT ? 'lt-LT' : 'en-GB');
  };

  const formatCurrency = (amount: number) => {
    return isLT ? `${amount.toFixed(2)} EUR` : `EUR ${amount.toFixed(2)}`;
  };

  const getInvoiceNumber = () => {
    const prefix = settings.invoicePrefix || 'CM';
    const num = settings.nextInvoiceNumber?.toString().padStart(4, '0') || '0001';
    return invoice.invoiceNumber || `${prefix}-${num}`;
  };

  const subtotal = invoice.lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || invoice.amount || 0;
  const vatRate = settings.isVatPayer ? settings.vatRate : 0;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  const lineItems = invoice.lineItems?.length > 0 
    ? invoice.lineItems 
    : [{
        description: t.description,
        quantity: 1,
        unitPrice: invoice.amount || 0,
        total: invoice.amount || 0,
      }];

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 40,
      fontFamily: 'Courier',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: '#0a0a0a',
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#0a0a0a',
      letterSpacing: 2,
    },
    subtitle: {
      fontSize: 10,
      color: '#666',
      marginTop: 4,
    },
    invoiceNumber: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 8,
    },
    status: {
      fontSize: 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 8,
      padding: '4 8',
      backgroundColor: invoice.status === 'PAID' ? '#22c55e' : invoice.status === 'SENT' ? '#3b82f6' : '#9ca3af',
      color: '#ffffff',
    },
    columns: {
      flexDirection: 'row',
      marginBottom: 30,
      gap: 30,
    },
    column: {
      flex: 1,
    },
    columnLabel: {
      fontSize: 9,
      color: '#ff006e',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      fontWeight: 'bold',
    },
    columnBox: {
      backgroundColor: '#f5f5f5',
      padding: 12,
      borderRadius: 4,
    },
    companyName: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#0a0a0a',
    },
    text: {
      fontSize: 9,
      color: '#333',
      marginBottom: 2,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: '#fafafa',
      padding: 10,
      gap: 20,
    },
    infoItem: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 8,
      color: '#666',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#0a0a0a',
    },
    table: {
      width: '100%',
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#0a0a0a',
      padding: 8,
    },
    tableHeaderCell: {
      fontSize: 8,
      color: '#ffffff',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e5e5',
      paddingVertical: 8,
      backgroundColor: '#fafafa',
    },
    tableRowAlt: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e5e5',
      paddingVertical: 8,
      backgroundColor: '#ffffff',
    },
    tableCell: {
      fontSize: 9,
      color: '#0a0a0a',
    },
    totals: {
      alignSelf: 'flex-end',
      width: 250,
      marginTop: 10,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    totalLabel: {
      fontSize: 9,
      color: '#666',
    },
    totalValue: {
      fontSize: 9,
      color: '#0a0a0a',
    },
    grandTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 2,
      borderTopColor: '#0a0a0a',
    },
    grandTotalLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#0a0a0a',
    },
    grandTotalValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ff006e',
    },
    bankSection: {
      marginTop: 30,
      padding: 12,
      backgroundColor: '#f5f5f5',
      borderLeftWidth: 3,
      borderLeftColor: '#ff006e',
    },
    bankTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    bankRow: {
      flexDirection: 'row',
      marginBottom: 3,
    },
    bankLabel: {
      width: 80,
      fontSize: 8,
      color: '#666',
    },
    bankValue: {
      flex: 1,
      fontSize: 9,
      fontWeight: 'bold',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    footerText: {
      fontSize: 8,
      color: '#666',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{settings.companyName}</Text>
            <Text style={styles.subtitle}>Motion Design Studio</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>{t.header}</Text>
            <Text style={styles.invoiceNumber}>{t.invNo}: {getInvoiceNumber()}</Text>
            <Text style={styles.status}>
              {invoice.status === 'DRAFT' ? t.draft : invoice.status === 'SENT' ? t.sent : invoice.status === 'PAID' ? t.paid : invoice.status}
            </Text>
          </View>
        </View>

        {/* From/To Columns */}
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnLabel}>{t.from}</Text>
            <View style={styles.columnBox}>
              <Text style={styles.companyName}>{settings.companyName}</Text>
              <Text style={styles.text}>{settings.companyAddress}</Text>
              <Text style={styles.text}>{settings.companyCity} {settings.companyCountry}</Text>
              {settings.companyCode && <Text style={styles.text}>{t.regNo}: {settings.companyCode}</Text>}
              <Text style={styles.text}>{settings.email}</Text>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.columnLabel}>{t.to}</Text>
            <View style={styles.columnBox}>
              <Text style={styles.companyName}>{invoice.client?.name || '-'}</Text>
              {invoice.client?.company && <Text style={styles.text}>{invoice.client.company}</Text>}
              <Text style={styles.text}>{invoice.client?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t.date}</Text>
            <Text style={styles.infoValue}>{formatDate(invoice.createdAt)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t.dueDate}</Text>
            <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t.project}</Text>
            <Text style={styles.infoValue}>{invoice.project?.name || '-'}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 4 }]}>{t.description}</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>{t.quantity}</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>{t.price}</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>{t.amount}</Text>
          </View>

          {lineItems.map((item, idx) => (
            <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, { flex: 4 }]} wrap>{item.description}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.subtotal}</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {settings.isVatPayer && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t.vat} ({settings.vatRate}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(vatAmount)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>{t.total}</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Bank Details */}
        {(settings.bankName || settings.bankIban) && (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>{t.paymentDetails}</Text>
            {settings.bankName && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>{t.bank}:</Text>
                <Text style={styles.bankValue}>{settings.bankName}</Text>
              </View>
            )}
            {settings.bankIban && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>IBAN:</Text>
                <Text style={styles.bankValue}>{settings.bankIban}</Text>
              </View>
            )}
            {settings.bankSwift && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>SWIFT:</Text>
                <Text style={styles.bankValue}>{settings.bankSwift}</Text>
              </View>
            )}
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>{t.reference}:</Text>
              <Text style={styles.bankValue}>{getInvoiceNumber()}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.thankYou}</Text>
          <Text style={styles.footerText}>{settings.website || settings.email}</Text>
        </View>

      </Page>
    </Document>
  );
}
