'use client';

import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import type { InvoiceWithRelations } from '@/hooks/useInvoices';
import type { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface InvoicePDFProps {
  invoice: InvoiceWithRelations;
  settings?: InvoiceSettings;
}

// Simplified Invoice PDF - using ASCII-safe text
export default function InvoicePDF({ invoice, settings }: InvoicePDFProps) {
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

  const isLT = mergedSettings.defaultLanguage === 'lt';

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return isLT ? d.toLocaleDateString('lt-LT') : d.toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number) => {
    return isLT ? `${amount.toFixed(2)} EUR` : `EUR ${amount.toFixed(2)}`;
  };

  const getInvoiceNumber = () => {
    return invoice.invoiceNumber || `${mergedSettings.invoicePrefix}-${invoice.id.slice(-4).toUpperCase()}`;
  };

  const subtotal = invoice.lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || invoice.amount || 0;
  const vatAmount = mergedSettings.isVatPayer ? subtotal * (mergedSettings.vatRate / 100) : 0;
  const total = subtotal + vatAmount;

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      backgroundColor: '#ffffff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
      borderBottom: '2px solid #0a0a0a',
      paddingBottom: 20,
    },
    companyInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    invoiceTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 3,
    },
    invoiceNumber: {
      fontSize: 12,
      marginTop: 5,
      fontWeight: 'bold',
    },
    columns: {
      flexDirection: 'row',
      gap: 40,
      marginBottom: 30,
    },
    column: {
      flex: 1,
    },
    columnTitle: {
      fontSize: 10,
      textTransform: 'uppercase',
      color: '#ff006e',
      marginBottom: 8,
      fontWeight: 'bold',
    },
    columnBox: {
      backgroundColor: '#f5f5f5',
      padding: 12,
      borderRadius: 4,
    },
    columnText: {
      fontSize: 10,
      marginBottom: 3,
    },
    infoRow: {
      flexDirection: 'row',
      gap: 40,
      marginBottom: 20,
      backgroundColor: '#fafafa',
      padding: 10,
    },
    infoItem: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 8,
      color: '#666',
      textTransform: 'uppercase',
    },
    infoValue: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    table: {
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#0a0a0a',
      padding: 8,
    },
    tableHeaderCell: {
      fontSize: 8,
      color: 'white',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1px solid #e0e0e0',
      padding: 8,
      backgroundColor: '#f9f9f9',
    },
    tableRowAlt: {
      flexDirection: 'row',
      borderBottom: '1px solid #e0e0e0',
      padding: 8,
      backgroundColor: '#fff',
    },
    tableCell: {
      fontSize: 9,
    },
    totals: {
      alignSelf: 'flex-end',
      width: 250,
      marginTop: 20,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    grandTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTop: '2px solid #0a0a0a',
      paddingTop: 10,
      marginTop: 10,
    },
    grandTotalLabel: {
      fontSize: 12,
      fontWeight: 'bold',
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
      borderLeft: '3px solid #ff006e',
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
      width: 70,
      fontSize: 9,
      color: '#666',
    },
    bankValue: {
      flex: 1,
      fontSize: 9,
      fontWeight: 'bold',
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 40,
      right: 40,
      borderTop: '1px solid #e0e0e0',
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    footerText: {
      fontSize: 8,
      color: '#666',
    },
  });

  const lineItems = invoice.lineItems || [{
    description: isLT ? 'Paslaugos' : 'Services',
    quantity: 1,
    unitPrice: invoice.amount || 0,
    total: invoice.amount || 0,
  }];

  // PDF Document
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{mergedSettings.companyName}</Text>
            <Text style={styles.columnText}>{mergedSettings.companyAddress}</Text>
            <Text style={styles.columnText}>{mergedSettings.companyCity} {mergedSettings.companyCountry}</Text>
            {mergedSettings.companyCode && (
              <Text style={styles.columnText}>{isLT ? 'Im.kodas:' : 'Reg.nr:'} {mergedSettings.companyCode}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>{isLT ? 'SASKAITA' : 'INVOICE'}</Text>
            <Text style={styles.invoiceNumber}>Nr: {getInvoiceNumber()}</Text>
          </View>
        </View>

        {/* From/To */}
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>{isLT ? 'PARDAVEJAS' : 'FROM'}</Text>
            <View style={styles.columnBox}>
              <Text style={{...styles.columnText, fontWeight: 'bold'}}>{mergedSettings.companyName}</Text>
              <Text style={styles.columnText}>{mergedSettings.companyAddress}</Text>
              <Text style={styles.columnText}>{mergedSettings.companyCity}</Text>
              <Text style={styles.columnText}>{mergedSettings.email}</Text>
            </View>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>{isLT ? 'PIRKEJAS' : 'TO'}</Text>
            <View style={styles.columnBox}>
              <Text style={{...styles.columnText, fontWeight: 'bold'}}>{invoice.client?.name || '-'}</Text>
              {invoice.client?.company && (
                <Text style={styles.columnText}>{invoice.client.company}</Text>
              )}
              <Text style={styles.columnText}>{invoice.client?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{isLT ? 'Data' : 'Date'}</Text>
            <Text style={styles.infoValue}>{formatDate(invoice.createdAt)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{isLT ? 'Apmoketi iki' : 'Due Date'}</Text>
            <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{isLT ? 'Projektas' : 'Project'}</Text>
            <Text style={styles.infoValue}>{invoice.project?.name || '-'}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, {flex: 4}]}>{isLT ? 'Aprasymas' : 'Description'}</Text>
            <Text style={[styles.tableHeaderCell, {flex: 1, textAlign: 'right'}]}>{isLT ? 'Kiekis' : 'Qty'}</Text>
            <Text style={[styles.tableHeaderCell, {flex: 1.5, textAlign: 'right'}]}>{isLT ? 'Kaina' : 'Price'}</Text>
            <Text style={[styles.tableHeaderCell, {flex: 1.5, textAlign: 'right'}]}>{isLT ? 'Suma' : 'Total'}</Text>
          </View>
          {lineItems.map((item, idx) => (
            <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, {flex: 4}]}>{item.description}</Text>
              <Text style={[styles.tableCell, {flex: 1, textAlign: 'right'}]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, {flex: 1.5, textAlign: 'right'}]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, {flex: 1.5, textAlign: 'right'}]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>{isLT ? 'Suma:' : 'Subtotal:'}</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          {mergedSettings.isVatPayer && (
            <View style={styles.totalRow}>
              <Text>PVM ({mergedSettings.vatRate}%):</Text>
              <Text>{formatCurrency(vatAmount)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>{isLT ? 'VISO:' : 'TOTAL:'}</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Bank Details */}
        {(mergedSettings.bankName || mergedSettings.bankIban) && (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>{isLT ? 'Mokejimo informacija' : 'Payment Details'}</Text>
            {mergedSettings.bankName && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>{isLT ? 'Bankas:' : 'Bank:'}</Text>
                <Text style={styles.bankValue}>{mergedSettings.bankName}</Text>
              </View>
            )}
            {mergedSettings.bankIban && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>IBAN:</Text>
                <Text style={styles.bankValue}>{mergedSettings.bankIban}</Text>
              </View>
            )}
            {mergedSettings.bankSwift && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>SWIFT:</Text>
                <Text style={styles.bankValue}>{mergedSettings.bankSwift}</Text>
              </View>
            )}
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>{isLT ? 'Paskirtis:' : 'Ref:'}</Text>
              <Text style={styles.bankValue}>{getInvoiceNumber()}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} style={{position: 'absolute', bottom: 40, left: 40, right: 40}}>
          <Text style={styles.footerText}>{isLT ? 'Aciu uz pasitikejima!' : 'Thank you!'}</Text>
          <Text style={styles.footerText}>{mergedSettings.website || mergedSettings.email}</Text>
        </View>
      </Page>
    </Document>
  );

  // Return viewer or download link
  return (
    <PDFViewer width="100%" height="600">
      <MyDocument />
    </PDFViewer>
  );
}
