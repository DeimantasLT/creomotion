# Invoicing Components

## Components

### InvoiceForm
Create new invoices from time entries or manual line items.

**Features:**
- Select client and project
- Auto-generate line items from billable time entries
- Add manual line items (hourly or fixed cost)
- Tax rate configuration (default 21%)
- Notes and terms section
- Real-time total calculation
- Client details (email, address) input

**Props:**
```typescript
interface InvoiceFormProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  onSubmit: (invoice: Invoice) => void;
  onCancel?: () => void;
  defaultHourlyRate?: number;
}
```

### InvoicePDF
Generate and download PDF invoices using react-pdf.

**Features:**
- Brutalist black/white/coral design
- Professional invoice layout
- Company and client info sections
- Itemized line items table
- Subtotal, tax, and total calculation
- Status badge overlay (sent/paid/overdue)
- Download as PDF
- Preview mode with inline viewer

**Props:**
```typescript
interface InvoicePDFProps {
  invoice: Invoice;
  showPreview?: boolean;
}
```

### InvoiceStatusBadge
Display colored status badges for invoices.

```typescript
<InvoiceStatusBadge status="draft" | "sent" | "paid" | "overdue" />
```

### InvoiceListItem
Clickable invoice card for lists.

```typescript
<InvoiceListItem 
  invoice={invoice} 
  onClick={() => openInvoice(invoice)} 
/>
```

## Invoice Status Workflow
```
Draft → Sent → Paid
   ↓
Overdue (if past due date)
```

## Design System
- Brutalist black/white/coral color scheme
- 8px offset box shadows
- 2px solid borders (no border radius)
- Space Grotesk for headers
- JetBrains Mono for data and labels
- Helvetica in PDF documents
