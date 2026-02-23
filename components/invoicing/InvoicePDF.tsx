"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { motion } from "framer-motion";
import { Download, Eye, FileText } from "lucide-react";

interface InvoiceLineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  type: "time" | "fixed";
  timeEntryId?: string;
}

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  projectId: string;
  projectName: string;
  date: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  notes: string;
}

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

// Invoice Document component
const InvoiceDocument = ({ invoice }: { invoice: Invoice }) => {
  const companyInfo = {
    name: "CREOMOTION STUDIO",
    address: "123 Creative Avenue",
    city: "Vilnius, Lithuania",
    email: "hello@creomotion.studio",
    vat: "LT123456789",
  };

  const formattedDate = (dateStr: string) => {
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
        {invoice.status !== "draft" && (
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
              <Text style={styles.invoiceNumber}>{invoice.number}</Text>
            </View>
          </View>

          <View style={styles.headerGrid}>
            <View style={styles.headerBox}>
              <Text style={styles.headerLabel}>ISSUE DATE</Text>
              <Text style={styles.headerValue}>{formattedDate(invoice.date)}</Text>
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
              <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>HOURS</Text>
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
                  {item.type === "time" ? item.hours.toFixed(1) : item.hours}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tableCell, styles.tableCellRight]}>€{item.rate.toFixed(2)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tableCell, styles.tableCellRight]}>€{item.amount.toFixed(2)}</Text>
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

// Main component with controls
interface InvoicePDFProps {
  invoice: Invoice;
  showPreview?: boolean;
}

export default function InvoicePDF({ invoice, showPreview = false }: InvoicePDFProps) {
  const filename = `${invoice.number.replace(/-/g, "_")}.pdf`;

  if (showPreview) {
    return (
      <div className="border-2 border-black" style={{ boxShadow: "8px 8px 0 0 #000" }}>
        <div className="border-b-2 border-black bg-black text-white p-4">
          <h3 className="font-display text-xl font-bold tracking-tight">INVOICE PREVIEW</h3>
        </div>
        <div className="h-[600px]">
          <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
            <InvoiceDocument invoice={invoice} />
          </PDFViewer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <PDFDownloadLink
        document={<InvoiceDocument invoice={invoice} />}
        fileName={filename}
        className="flex-1"
      >
        {({ loading }) => (
          <motion.button
            disabled={loading}
            className="w-full border-2 border-black bg-black text-white px-4 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ boxShadow: "4px 4px 0 0 #FF2E63" }}
            whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #FF2E63" }}
            whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0 0 #FF2E63" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                DOWNLOAD PDF
              </>
            )}
          </motion.button>
        )}
      </PDFDownloadLink>
    </div>
  );
}

// Invoice status badge component for lists
export function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const styles = {
    draft: "bg-gray-200 text-gray-700 border-gray-400",
    sent: "bg-black text-white border-black",
    paid: "bg-[#FF2E63] text-white border-[#FF2E63]",
    overdue: "bg-white text-[#FF2E63] border-[#FF2E63]",
  };

  return (
    <span className={`px-3 py-1 text-xs font-bold mono border-2 ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

// Invoice list item component
export function InvoiceListItem({
  invoice,
  onClick,
}: {
  invoice: Invoice;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className={`border-2 border-black p-4 bg-white ${onClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
      whileHover={onClick ? { boxShadow: "4px 4px 0 0 #000", x: -2, y: -2 } : {}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="border-2 border-black p-3 bg-black text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold">{invoice.number}</div>
            <div className="text-sm text-gray-600">
              {invoice.clientName} — {invoice.projectName}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold">
            €{invoice.total.toFixed(0)}
          </div>
          <div className="text-xs mono text-gray-500">
            {new Date(invoice.date).toLocaleDateString()}
          </div>
        </div>
        <div className="ml-4">
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </div>
    </motion.div>
  );
}

