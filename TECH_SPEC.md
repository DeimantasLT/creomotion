# Creomotion - Technical Specification
## Architecture Plan (Multi-Agent Coordination)

## 1. Shared Types (VISIEMS)
```typescript
// types/index.ts
export type UserRole = 'ADMIN' | 'EDITOR' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'COMPLETED';
  budget?: number;
  deadline?: Date;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  description?: string;
  duration: number; // minutes
  date: Date;
  billable: boolean;
  hourlyRate?: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate?: Date;
  paidAt?: Date;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

## 2. Agent Tasks (Sequence)

### Agent 1: ARCHITECT (1st)
**Task:** Setup project foundation
- Create types/index.ts (ALL types)
- Create lib/db.ts (Prisma client + exports)
- Create lib/auth.ts (JWT functions, NO api routes)
- Create middleware.ts (simple version)
- **Output:** Working imports/exports only
- **Must verify:** `import { User } from '@/types'` works

### Agent 2: BACKEND_API (2nd, after ARCHITECT)
**Task:** Create API routes using ARCHITECT types
- app/api/auth/login/route.ts
- app/api/auth/logout/route.ts
- app/api/projects/route.ts
- app/api/clients/route.ts
- app/api/time-entries/route.ts
- app/api/invoices/route.ts
- **Constraint:** ONLY use types from '@/types', NO new types
- **Must verify:** Each route imports correctly

### Agent 3: HERO_COMPONENT (3rd)
**Task:** Landing page hero only
- components/sections/HeroSubtle.tsx
- **Requirements:**
  - Subtle particle animation (max 30 particles)
  - Mouse parallax (max 10px movement)
  - NO WebGL if not needed - use CSS/Canvas 2D
  - Clean typography: "CREO" + "MOTION"
  - Light background (#F5F5F0)
  - Coral accent (#FF2E63) minimal
- **Reference:** nickolaskossup.com style
- **Must verify:** No import errors, client-side only

### Agent 4: LANDING_PAGES (4th, after HERO)
**Task:** Complete landing + portal + admin shell
- app/page.tsx (Home with Hero + sections)
- app/login/page.tsx
- app/admin/page.tsx (shell with navigation)
- app/portal/page.tsx (client view shell)
- **Constraint:** Use Hero from Agent 3, NO new hero code
- **Must verify:** All imports resolve

### Agent 5: ADMIN_DASHBOARD (5th, after LANDING)
**Task:** Admin functionality
- components/admin/Stats.tsx
- components/admin/ProjectList.tsx
- components/admin/ClientList.tsx
- **API Integration:** Use Agent 2's API routes
- **Must verify:** Fetch calls match API routes

### Agent 6: TIME_INVOICE (6th)
**Task:** Time tracking + Invoicing + PDF
- components/time/Timer.tsx
- components/time/TimeList.tsx
- components/invoice/InvoiceList.tsx
- components/invoice/InvoicePDF.tsx
- **Constraint:** Use shared types only
- **Must verify:** Invoice PDF generates

## 3. Coordination Rules
1. **NO agent creates new types** - import from '@/types'
2. **NO agent modifies another's files** without explicit handoff
3. **Each agent MUST verify:** `npm run build` succeeds before done
4. **Agent MUST report:** "Complete: [file list], Verified: build passes"
5. **If import missing:** Ask ARCHITECT to add to types, don't create locally

## 4. Build Verification (After ALL agents)
Final verification: `npm run build` must pass 100%
- No TypeScript errors
- No import errors
- No export errors
