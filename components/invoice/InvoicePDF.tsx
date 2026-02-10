"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Invoice, InvoiceLineItem } from "@/types";

// Brutalist PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  header: {
    borderBottom: 2,
    borderBottomColor: "#000000",
    paddingBottom: 20,
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brand: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  brandAccent: {
    color: "#FF2E63",
  },
  invoiceLabel: {
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    padding: "8 16",
  },
  headerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerBox: {
    width: "30%",
  },
  headerLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#FF2E63",
    marginBottom: 5,
  },
  headerValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  twoColumn: {
    flexDirection: "row",
    marginBottom: 30,
    border: 2,
    borderColor: "#000000",
  },
  column: {
    flex: 1,
    padding: 20,
  },
  columnLeft: {
    borderRight: 2,
    borderRightColor: "#000000",
  },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 3,
    color: "#FF2E63",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#333333",
  },
  clientName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  clientDetails: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#333333",
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000000",
    padding: "12 10",
  },
  tableHeaderCell: {
    color: "#FFFFFF",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#000000",
    padding: "12 10",
  },
  tableRowAlt: {
    backgroundColor: "#F5F5F0",
  },
  tableCell: {
    fontSize: 10,
  },
  tableCellRight: {
    textAlign: "right",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
  summaryBox: {
    width: 250,
    border: 2,
    borderColor: "#000000",
    backgroundColor: "#F5F5F0",
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: 2,
    borderTopColor: "#000000",
    paddingTop: 10,
    marginTop: 10,
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF2E63",
  },
  notes: {
    border: 2,
    borderColor: "#000000",
    padding: 15,
    marginTop: 20,
  },
  notesLabel: {
    fontSize: 8,
    letterSpacing: 3,
    color: "#FF2E63",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 2,
    borderTopColor: "#000000",
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#666666",
    textAlign: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 40,
    right: 40,
    backgroundColor: "#FF2E63",
    color: "#FFFFFF",
    padding: "8 16",
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "bold",
    transform: "rotate(15deg)",
  },
});

// Types for PDF
interface InvoicePDFData {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  projectName: string;
  issueDate: string;
  dueDate?: string;
  status: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

interface InvoiceDocumentProps {
  invoice: InvoicePDFData;
}

// Invoice Document component
const InvoiceDocument = ({ invoice }: InvoiceDocumentProps) => {
  const companyInfo = {
    name: "CREOMOTION STUDIO",
    address: "123 Creative Avenue",
    city: "Vilnius, Lithuania",
    email: "hello@creomotion.studio",
    vat: "LT123456789",
  };

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Status Badge (only for non-draft) */}
        {invoice.status !== "DRAFT" && (
          <View style={styles.statusBadge}>
            <Text>{invoice.status.toUpperCase()}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brand}>
                CREO<Text style={styles.brandAccent}>MOTION</Text>
              </Text>
            </View>
            <View>
              <Text style={styles.invoiceLabel}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            </View>
          </View>

          <View style={styles.headerGrid}>
            <View style={styles.headerBox}>
              <Text style={styles.headerLabel}>ISSUE DATE</Text>
              <Text style={styles.headerValue}>{formattedDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.headerBox}>
              <Text style={styles.headerLabel}>DUE DATE</Text>
              <Text style={styles.headerValue}>{formattedDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.headerBox}>
              <Text style={styles.headerLabel}>PROJECT</Text>
              <Text style={styles.headerValue}>{invoice.projectName}</Text>
            </View>
          </View>
        </View>

        {/* Two Column: From / To */}
        <View style={styles.twoColumn}>
          <View style={[styles.column, styles.columnLeft]}>
            <Text style={styles.sectionLabel}>FROM</Text>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetails}>
              {companyInfo.address}{"\n"}
              {companyInfo.city}{"\n"}
              {companyInfo.email}{"\n"}
              VAT: {companyInfo.vat}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionLabel}>BILL TO</Text>
            <Text style={styles.clientName}>{invoice.clientName}</Text>
            <Text style={styles.clientDetails}>
              {invoice.clientAddress || "Address not provided"}{"\n"}
              {invoice.clientEmail || "Email not provided"}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={{ flex: 3 }}>
              <Text style={styles.tableHeaderCell}>DESCRIPTION</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>QTY</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>RATE</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>AMOUNT</Text>
            </View>
          </View>

          {invoice.lineItems.map((item, index) => (
            <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
              <View style={{ flex: 3 }}>
                <Text style={styles.tableCell}>{item.description}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tableCell, styles.tableCellRight]}>
                  {item.quantity}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tableCell, styles.tableCellRight]}>€{item.unitPrice.toFixed(2)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tableCell, styles.tableCellRight]}>€{item.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>SUBTOTAL</Text>
              <Text style={styles.summaryValue}>€{invoice.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TAX ({invoice.taxRate}%)</Text>
              <Text style={styles.summaryValue}>€{invoice.taxAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>TOTAL</Text>
              <Text style={styles.summaryTotalValue}>€{invoice.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>NOTES & TERMS</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            CREOMOTION STUDIO • Motion Design & AI Video Production • hello@creomotion.studio
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper to transform DB Invoice to PDF data
export function transformInvoiceToPDFData(invoice: Invoice & { project?: { name: string }; client?: { name: string; email: string; company?: string }; createdAt?: Date | string }): InvoicePDFData {
  const lineItems = invoice.lineItems || [];
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 21; // Default tax rate
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    id: invoice.id,
    invoiceNumber: `INV-${invoice.id.slice(0, 8).toUpperCase()}`,
    clientName: invoice.client?.name || invoice.clientId,
    clientEmail: invoice.client?.email || "",
    clientAddress: invoice.client?.company || "",
    projectName: invoice.project?.name || invoice.projectId,
    issueDate: invoice.createdAt ? new Date(invoice.createdAt).toISOString() : new Date().toISOString(),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : undefined,
    status: invoice.status,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    total: invoice.amount || total,
    notes: `Payment due within 30 days. Status: ${invoice.status}`,
  };
}

interface InvoicePDFProps {
  invoice: InvoicePDFData | Invoice;
  showPreview?: boolean;
}

// Main component with controls
export default function InvoicePDF({ invoice, showPreview = false }: InvoicePDFProps) {
  // Transform if needed
  const pdfData = "lineItems" in invoice && Array.isArray(invoice.lineItems) && "project" in invoice 
    ? transformInvoiceToPDFData(invoice as Invoice & { project: { name: string }; client: { name: string; email: string } })
    : invoice as InvoicePDFData;

  const filename = `${pdfData.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  if (showPreview) {
    return (
      <div className="border-2 border-black" style={{ boxShadow: "8px 8px 0 0 #000" }}>
        <div className="border-b-2 border-black bg-black text-white p-4">
          <h3 className="font-display text-xl font-bold tracking-tight">INVOICE PREVIEW</h3>
        </div>
        <div className="h-[600px]">
          <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
            <InvoiceDocument invoice={pdfData} />
          </PDFViewer>
        </div>
      </div>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={pdfData} />}
      fileName={filename}
      className="w-full"
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="w-full border-2 border-black bg-black text-white px-4 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors"
          style={{ boxShadow: "4px 4px 0 0 #FF2E63" }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              GENERATING PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DOWNLOAD PDF
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}

export { InvoiceDocument };
