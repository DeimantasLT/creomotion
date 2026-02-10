# Time Tracking Components

## Components

### Timer
A project-based time tracking component with start/stop/pause functionality.

**Features:**
- Start/stop/pause timer per project
- Project selector with client info
- Elapsed time display (HH:MM:SS)
- Description input for each entry
- Billable/non-billable toggle
- Saves time entries when stopped

**Props:**
```typescript
interface TimerProps {
  projects: Project[];
  onEntryComplete: (entry: TimeEntry) => void;
}
```

### TimeEntryList
Display and manage time entries with filtering and editing capabilities.

**Features:**
- Daily/weekly/summary view modes
- Date navigation with prev/next controls
- Edit/delete entries inline
- Billable toggle per entry
- Project summary by client (summary view)
- Time and amount totals

**Props:**
```typescript
interface TimeEntryListProps {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onToggleBillable: (id: string) => void;
  hourlyRate?: number;
}
```

## Design System
Both components follow the Creomotion brutalist design system:
- Black 2px borders
- No border radius
- 8px 8px 0 #000 box shadows
- Coral (#FF2E63) accent color
- Space Grotesk display font
- JetBrains Mono for labels and data
