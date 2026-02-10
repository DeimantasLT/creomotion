# Creomotion - Motion Design & AI Video Production Platform

Premium portfolio + client portal + CRM for motion graphics studio transitioning to AI-powered video production.

---

## 🎬 About

**Creomotion** combines 16+ years of broadcast television experience with cutting-edge AI video tools to deliver premium content faster.

### Features
- 🎨 Public Portfolio (Nickolas Kossup-inspired design)
- 🏢 Client Portal (Frame.io-style collaboration)
- 💼 CRM Dashboard (invoicing, proposals, project tracking)
- 🤖 AI Integration (ComfyUI for brainstorming)
- 📁 Google Drive Integration (5TB storage)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15
- Google Drive API credentials

### Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start Docker services
docker-compose up -d

# 4. Setup database
npx prisma migrate dev

# 5. Run dev server
npm run dev
```

### Production Deployment

```bash
# Single command deploy
./scripts/deploy.sh
```

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Animations:** Framer Motion
- **State:** Zustand
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Storage:** Google Drive API
- **Auth:** NextAuth.js (magic links)
- **Background Jobs:** Inngest
- **PDF Generation:** Puppeteer + React-PDF

### File Structure
```
app/                   # Next.js 15 App Router
├── (sections)/        # Portfolio sections
├── api/              # API routes
├── layout.tsx        # Root layout
└── page.tsx          # Landing page

components/
├── sections/         # Page sections (Hero, Gallery, etc.)
├── ui/              # UI components
├── shared/          # Shared components
└── Navigation.tsx   # Site navigation

lib/
├── animations.ts    # Framer Motion variants
├── utils.ts         # Utilities
└── google-drive.ts  # Drive API wrapper

prisma/
└── schema.prisma   # Database schema (15+ models)

public/
├── videos/         # Showreel & hero video
└── images/         # Project thumbnails
```

---

## 🎨 Design System

### Colors
- **Background:** `#0A0A0F` (studio black)
- **Accent Coral:** `#FF2E63` (creative energy)
- **Accent Cyan:** `#08D9D6` (AI signal)
- **Surface:** `#141419`

### Typography
- **Display:** Space Grotesk (bold headlines)
- **Body:** Inter Tight (clean readability)
- **Mono:** JetBrains Mono (technical data)

---

## 📅 Development Phases

### Phase 1 (Days 1-2) - Portfolio MVP
- [x] Hero section with video background
- [x] Project gallery grid
- [x] Services section
- [x] Contact form
- [x] Navigation & footer

### Phase 2 (Days 3-4) - Client Portal
- [ ] Authentication (magic links)
- [ ] Project timeline view
- [ ] File review interface
- [ ] Approval workflow

### Phase 3 (Days 5-6) - CRM
- [ ] Admin dashboard
- [ ] Time tracking
- [ ] Invoice generator
- [ ] Proposal builder

### Phase 4 (Day 7) - Deploy
- [ ] Production build
- [ ] Docker production setup
- [ ] SSL/HTTPS
- [ ] Monitoring

---

## 🔐 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/creomotion"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
GOOGLE_DRIVE_FOLDER_ID=""

# Email
SENDGRID_API_KEY="" # or
RESEND_API_KEY=""

# Background Jobs
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

---

## 📚 Documentation

- `docs/creomotion-design-system.md` - Complete design specification
- `docs/creomotion-architecture.md` - System architecture (26KB)
- `docs/api-spec.md` - API specification (29KB)
- `docs/backend-architecture.md` - Backend docs (29KB)
- `docs/frontend-architecture.md` - Frontend patterns
- `docs/creomotion-ideation.md` - MVP scope & personas

---

## 🎭 Credits

**Owner:** Deimantas (16+ years broadcast motion design)  
**Build:** Nexus 🎭 AI Agent Army  
**Deadlin:** 7-day emergency launch

---

## 🚀 Deployment URLs

- **Production:** https://creomotion.lt
- **Staging:** http://localhost:3000 (dev)
- **Database Admin:** http://localhost:5050 (PGAdmin)
