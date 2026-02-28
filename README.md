# CineNest — Private Theater Booking Platform

## Overview

CineNest is a full-stack private theater booking platform built for Hyderabad, operating across **2 locations** (Hitec City and Miyapur). The platform allows customers to browse and book private theater experiences online, with support for add-ons (cakes, decor, photography), food pre-orders, WhatsApp-based notifications, an admin dashboard for operations, customer reviews, and an SEO-optimized public-facing storefront.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query |
| **Backend** | Node.js 20, Express.js, TypeScript, Prisma ORM |
| **Database** | PostgreSQL (Supabase recommended) |
| **Cache** | Redis (Upstash recommended) |
| **Payments** | Razorpay (primary), PhonePe (fallback) |
| **WhatsApp** | WATI |
| **Storage** | Cloudinary |
| **Deployment** | Vercel (frontend), Railway (backend) |

---

## Prerequisites

Before getting started, ensure you have the following installed and configured:

- **Node.js** 20 LTS
- **npm** 10+
- **PostgreSQL** database — [Supabase](https://supabase.com) recommended (free tier available)
- **Redis** instance — [Upstash](https://upstash.com) recommended (free tier available)

---

## Project Structure

```
cinenest/
├── frontend/          # Next.js 14 App Router
├── backend/           # Express.js REST API
├── SPEC.md            # Product specification
├── CODING_STANDARDS.md # Engineering standards
└── README.md
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd cinenest
npm install          # installs root workspace deps
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Fill in your actual values in both files
```

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Run Development Servers

```bash
# From root — runs both frontend and backend concurrently
npm run dev

# Or individually:
npm run dev:frontend   # Next.js on http://localhost:3000
npm run dev:backend    # Express API on http://localhost:4000
```

---

## Key URLs (Development)

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Prisma Studio | Run `npm run db:studio` in `backend/` |

---

## Admin Access (after seed)

- **URL:** http://localhost:3000/admin
- **Email:** admin@cinenest.com
- **Password:** Admin@123
- **WARNING:** Change the default password immediately after first login.

---

## Environment Variables

All required environment variables are documented in:

- `backend/.env.example` — database URL, Redis, Razorpay, PhonePe, WATI, Cloudinary, JWT secrets, etc.
- `frontend/.env.example` — public API URL, Razorpay public key, analytics IDs, etc.

Copy each file to its non-example counterpart and fill in your actual values before running the application.

---

## Business Name Placeholder

All files across the monorepo use **"CineNest"** as a placeholder name. When the final business name is decided, run the following command from the repository root to replace it across all source files:

```bash
# Replace across all files (case-sensitive variants)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i 's/CineNest/YourBusinessName/g' {} +
```

Run this command multiple times with different case variants (e.g., `cinenest`, `CINENEST`) to cover all occurrences.

---

## Open Items Before Launch

See `SPEC.md` Section 19 for the full list. There are **12 items pending**, including:

- Final business name and branding
- Production domain name
- Theater room data (names, capacities, pricing, photos) for both locations
- WhatsApp business number (for WATI integration)
- Razorpay / PhonePe merchant account credentials
- Cloudinary production bucket configuration
- Supabase production project setup
- Upstash Redis production instance
- Google Analytics / Search Console property IDs
- Legal pages content (Terms of Service, Privacy Policy, Refund Policy)
- Admin user credentials for production
- SMS/OTP provider selection and configuration
