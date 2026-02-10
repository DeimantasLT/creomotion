# Time Tracking & Invoicing Implementation

## Overview
Complete time tracking and invoicing system implemented for Creomotion studio management.

## Files Created

### Components

#### Time Tracking
- `components/timetracking/Timer.tsx` - Timer component with start/stop/pause per project
- `components/timetracking/TimeEntryList.tsx` - List view with daily/weekly/summary modes
- `components/timetracking/index.ts` - Component exports
- `components/timetracking/README.md` - Documentation

#### Invoicing  
- `components/invoicing/InvoiceForm.tsx` - Create invoices from time entries or manual items
- `components/invoicing/InvoicePDF.tsx` - PDF generation with brutalist design
- `components/invoicing/index.ts` - Component exports
- `components/invoicing/README.md` - Documentation

### API Routes
- `app/api/time-entries/route.ts` - GET, POST, PATCH, DELETE for time entries
- `app/api/invoices/route.ts` - GET, POST, PATCH, DELETE for invoices

### Pages
- `app/admin/time-invoicing/page.tsx` - Integrated time & invoicing dashboard
- Updated `app/admin/page.tsx` - Added navigation link to new section

### Types & Utilities
- `types/time-tracking.ts` - TypeScript interfaces
- `lib/prisma.ts` - Prisma client singleton
- `prisma/schema.prisma` - Updated with TimeEntry, Invoice, InvoiceLineItem models

## Features Implemented

### Time Tracking
1. **Timer Component**
   - Start/stop/pause timer per project
   - Large HH:MM:SS display (animated)
   - Project dropdown selector
   - Description field
   - Billable/non-billable toggle
   - Auto-save entry when stopped

2. **Time Entry List**
   - Daily view: today's entries
   - Weekly view: entries by project
   - Summary view: by client/project totals
   - Date navigation (prev/next)
   - Edit/delete entries
   - Toggle billable status inline
   - Real-time totals (time + billable amount)

3. **Time Reports**
   - Total hours summary
   - Billable percentage
   - Amount calculations (hourly rate × hours)

### Invoicing
1. **Create Invoice**
   - Client & project selector
   - Auto-generate from billable time entries
   - Manual line items (hourly/fixed)
   - Tax rate input (default 21%)
   - Invoice notes/terms
   - Real-time subtotal/tax/total

2. **PDF Generation**
   - Brutalist design (black/white/coral)
   - Professional invoice layout
   - Company info header
   - Client billing details
   - Itemized line items table
   - Status badge overlay
   - Download PDF functionality

3. **Invoice Status**
   - Draft → Sent → Paid workflow
   - Overdue status support
   - Status badges in admin
   - Mark as sent/paid actions
   - Invoice preview modal

## Design System
Consistent with Creomotion brutalist aesthetic:
- Colors: #F5F5F0 (bg), #000000 (border/text), #FF2E63 (accent/coral)
- 2px solid black borders
- 8px 8px 0 #000 box shadows
- No border radius
- Space Grotesk display font
- JetBrains Mono for data/labels
- Framer Motion animations

## Database Schema Updates

### TimeEntry model additions:
- `billable` Boolean (default: true)
- `invoiced` Boolean (default: false)
- `invoiceId` String? (relation to Invoice)
- `duration` stored as seconds

### Invoice model:
- Complete invoice fields (number, date, dueDate, status)
- Financial fields (subtotal, taxRate, taxAmount, total)
- Relations to Project and TimeEntry

### InvoiceLineItem model:
- Line item details (description, hours, rate, amount)
- Type enum (TIME, FIXED)
- Optional timeEntryId reference

## Usage

### Timer
```tsx
<Timer 
  projects={projects} 
  onEntryComplete={(entry) => saveEntry(entry)} 
/>
```

### Time Entry List
```tsx
<TimeEntryList
  entries={timeEntries}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleBillable={handleToggle}
  hourlyRate={100}
/>
```

### Invoice Form
```tsx
<InvoiceForm
  projects={projects}
  timeEntries={billableEntries}
  onSubmit={(invoice) => saveInvoice(invoice)}
  defaultHourlyRate={100}
/>
```

### Generate PDF
```tsx
<InvoicePDF invoice={invoice} />
// or with preview
<InvoicePDF invoice={invoice} showPreview={true} />
```

## Next Steps
1. Run `prisma migrate dev` to apply schema changes
2. Test timer functionality in `/admin/time-invoicing`
3. Create invoices from time entries
4. Download and verify PDF generation

## API Endpoints

### Time Entries
- `GET /api/time-entries?projectId=&startDate=&endDate=&billable=`
- `POST /api/time-entries` - Create entry
- `PATCH /api/time-entries` - Update entry
- `DELETE /api/time-entries?id=xxx` - Delete entry

### Invoices
- `GET /api/invoices?projectId=&clientId=&status=`
- `POST /api/invoices` - Create invoice + mark time entries as invoiced
- `PATCH /api/invoices` - Update status, notes, dates
- `DELETE /api/invoices?id=xxx` - Delete invoice + unmark time entries
