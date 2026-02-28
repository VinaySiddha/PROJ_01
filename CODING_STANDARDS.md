# Coding Standards & Engineering Rules
## Private Theater Booking Platform
**Version:** 1.0 | **Date:** 2026-02-28 | **Enforced From:** Day 1 of Development

---

## Table of Contents
1. [Core Philosophy](#1-core-philosophy)
2. [Project Structure](#2-project-structure)
3. [Naming Conventions](#3-naming-conventions)
4. [TypeScript Rules](#4-typescript-rules)
5. [Component Rules (React / Next.js)](#5-component-rules-react--nextjs)
6. [Commenting Standards](#6-commenting-standards)
7. [API & Backend Rules](#7-api--backend-rules)
8. [Database & Prisma Rules](#8-database--prisma-rules)
9. [State Management Rules](#9-state-management-rules)
10. [CSS & Styling Rules](#10-css--styling-rules)
11. [Error Handling Rules](#11-error-handling-rules)
12. [Testing Rules](#12-testing-rules)
13. [Git & Commit Rules](#13-git--commit-rules)
14. [Security Rules](#14-security-rules)
15. [Performance Rules](#15-performance-rules)
16. [Error Logging Rules](#16-error-logging-rules)
    - 16.0 Two-Layer Architecture
    - 16.1 Winston Logger Setup
    - 16.2 Log Levels
    - 16.3 What Every Error Log Must Include
    - 16.4 Request ID Propagation
    - 16.5 Log What You Promise to Fix
    - 16.6 Never Log Sensitive Data
    - 16.7 Error Master Table (DB schema + full seed data)
    - 16.8 Error Log Table (DB schema)
    - 16.9 ErrorLogService
    - 16.10 Updated Global Error Handler
    - 16.11 Updated AppError Class
    - 16.12 Admin Dashboard — Error Logs View
17. [Audit Logging Rules](#17-audit-logging-rules)
18. [File & Folder Checklist](#18-file--folder-checklist)

---

## 1. Core Philosophy

These four rules govern every line of code written in this project:

```
1. REUSABILITY   — Write once, use everywhere. Never duplicate logic.
2. CLARITY       — Any developer should understand the code in 60 seconds.
3. MINIMALISM    — If it is not needed right now, it does not exist.
4. SAFETY        — Validate at boundaries, trust nothing from outside.
```

### 1.1 The "Would I Be Embarrassed?" Test
Before committing any code, ask:
- Would I be embarrassed if a senior engineer reviewed this?
- Is there a simpler way to write this?
- Does every line earn its place?

### 1.2 What We Never Do
- Never copy-paste logic — extract it into a shared utility instead
- Never leave `TODO` or `FIXME` in committed code — create a GitHub issue
- Never commit commented-out code — delete it, Git history preserves it
- Never use `any` in TypeScript — always type properly
- Never hardcode values that belong in config or env variables
- Never write a function longer than 50 lines — break it up

---

## 2. Project Structure

### 2.1 Frontend (Next.js App Router)

```
/frontend
├── app/                          # Next.js App Router pages
│   ├── (public)/                 # Public route group (no auth)
│   │   ├── page.tsx              # Home page  /
│   │   ├── about/page.tsx        # About page  /about
│   │   ├── theaters/             # Theater listing and detail
│   │   │   ├── page.tsx          # /theaters
│   │   │   └── [id]/page.tsx     # /theaters/:id
│   │   ├── gallery/page.tsx
│   │   ├── addons/page.tsx
│   │   ├── food/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── reviews/page.tsx
│   │   └── [policy]/page.tsx     # /refund-policy, /privacy-policy, /terms
│   ├── (booking)/                # Booking wizard route group
│   │   └── theater/[id]/
│   │       ├── book/page.tsx     # Step 1 — slot selection
│   │       ├── occasion/page.tsx # Step 2 — occasion
│   │       ├── cakes/page.tsx    # Step 3 — cake
│   │       ├── addons/page.tsx   # Step 4 — add-ons
│   │       ├── food/page.tsx     # Step 5 — food
│   │       ├── details/page.tsx  # Step 6 — customer form
│   │       └── summary/page.tsx  # Step 7 — review & pay
│   ├── (auth)/                   # Auth route group
│   │   └── my-bookings/
│   │       ├── page.tsx          # Bookings list
│   │       └── login/page.tsx    # OTP login
│   ├── (admin)/                  # Admin route group (protected)
│   │   └── admin/
│   │       ├── layout.tsx        # Admin layout with sidebar
│   │       ├── page.tsx          # Dashboard
│   │       ├── bookings/         # Booking management
│   │       ├── theaters/         # Theater CRUD
│   │       ├── addons/           # Add-on management
│   │       ├── food/             # Food menu management
│   │       ├── reviews/          # Review moderation
│   │       ├── offers/           # Coupon management
│   │       └── settings/         # Site settings
│   ├── api/                      # Next.js API routes (thin — mostly proxy to backend)
│   ├── layout.tsx                # Root layout
│   ├── error.tsx                 # Global error boundary
│   └── not-found.tsx             # 404 page
│
├── components/                   # All reusable React components
│   ├── ui/                       # shadcn/ui base components (auto-generated, do not edit)
│   ├── common/                   # Shared across the whole app
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── PageWrapper.tsx
│   ├── theater/                  # Theater-specific components
│   │   ├── TheaterCard.tsx
│   │   ├── TheaterGallery.tsx
│   │   └── TheaterSpecs.tsx
│   ├── booking/                  # Booking wizard components
│   │   ├── BookingStepIndicator.tsx
│   │   ├── SlotPicker.tsx
│   │   ├── OccasionSelector.tsx
│   │   ├── CakeSelector.tsx
│   │   ├── AddOnSelector.tsx
│   │   └── BookingSummaryCard.tsx
│   ├── review/                   # Review components
│   │   ├── ReviewCard.tsx
│   │   ├── StarRating.tsx
│   │   └── ReviewForm.tsx
│   └── admin/                    # Admin-only components
│       ├── AdminSidebar.tsx
│       ├── BookingsTable.tsx
│       └── StatsCard.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useBooking.ts             # Booking state + actions
│   ├── useAuth.ts                # Auth state + OTP flow
│   ├── useTheaters.ts            # Fetch theaters with SWR/React Query
│   └── useSlotAvailability.ts    # Real-time slot checking
│
├── lib/                          # Pure utility functions (no React)
│   ├── api.ts                    # Typed API client (axios/fetch wrapper)
│   ├── formatters.ts             # Currency, date, phone formatters
│   ├── validators.ts             # Zod schemas for all forms
│   └── constants.ts              # App-wide constants
│
├── store/                        # Zustand global state
│   ├── bookingStore.ts           # Booking wizard state
│   └── authStore.ts              # Customer auth state
│
├── types/                        # TypeScript type definitions
│   ├── theater.ts
│   ├── booking.ts
│   ├── addon.ts
│   ├── review.ts
│   └── api.ts                    # API request/response types
│
├── public/                       # Static assets
│   ├── icons/
│   └── og-image.jpg              # Default Open Graph image
│
├── .env.local                    # Local env vars (never committed)
├── .env.example                  # Env var template (committed, no real values)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### 2.2 Backend (Node.js + Express)

```
/backend
├── src/
│   ├── routes/                   # Express route definitions (thin — only routing)
│   │   ├── index.ts              # Mounts all routers
│   │   ├── theaters.ts
│   │   ├── bookings.ts
│   │   ├── payments.ts
│   │   ├── auth.ts
│   │   ├── reviews.ts
│   │   └── admin/                # Admin-only routes
│   │       ├── bookings.ts
│   │       ├── theaters.ts
│   │       └── settings.ts
│   ├── controllers/              # Request handling logic
│   │   ├── theaters.controller.ts
│   │   ├── bookings.controller.ts
│   │   ├── payments.controller.ts
│   │   ├── auth.controller.ts
│   │   └── reviews.controller.ts
│   ├── services/                 # Business logic (no HTTP knowledge)
│   │   ├── theaters.service.ts
│   │   ├── bookings.service.ts
│   │   ├── payments.service.ts
│   │   ├── slots.service.ts      # Slot availability + locking
│   │   ├── whatsapp.service.ts   # WhatsApp message sending
│   │   └── reviews.service.ts
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── admin.middleware.ts   # Admin role check
│   │   ├── validate.middleware.ts# Zod request validation
│   │   ├── rateLimiter.ts        # Rate limiting per IP
│   │   └── errorHandler.ts       # Global error handler
│   ├── prisma/                   # Database layer
│   │   └── client.ts             # Singleton Prisma client
│   ├── redis/                    # Redis layer
│   │   └── client.ts             # Singleton Redis client
│   ├── utils/                    # Pure helper functions
│   │   ├── response.ts           # Standardized API response builders
│   │   ├── formatters.ts         # Date/currency helpers
│   │   └── logger.ts             # Winston logger setup
│   ├── config/                   # App configuration
│   │   └── index.ts              # Reads env vars, exports typed config
│   └── app.ts                    # Express app setup (no listen call)
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Auto-generated migrations
│
├── .env                          # Local env vars (never committed)
├── .env.example                  # Template
├── package.json
└── tsconfig.json
```

---

## 3. Naming Conventions

### 3.1 Files & Folders
| Type | Convention | Example |
|---|---|---|
| React component file | PascalCase | `TheaterCard.tsx` |
| Hook file | camelCase, prefix `use` | `useBooking.ts` |
| Utility/lib file | camelCase | `formatters.ts` |
| Page file (Next.js) | always `page.tsx` | `page.tsx` |
| Type file | camelCase | `theater.ts` |
| Backend route file | camelCase | `theaters.ts` |
| Backend controller | camelCase + `.controller.ts` | `theaters.controller.ts` |
| Backend service | camelCase + `.service.ts` | `theaters.service.ts` |

### 3.2 Variables & Functions
| Type | Convention | Example |
|---|---|---|
| Variable | camelCase | `theaterList`, `isLoading` |
| Boolean variable | prefix `is`, `has`, `can` | `isAvailable`, `hasDiscount` |
| Function | camelCase, verb-first | `fetchTheaters()`, `calculateTotal()` |
| Async function | suffix with `Async` or use `await` at call site | `getBookingAsync()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_CAPACITY`, `SLOT_LOCK_TTL` |
| Event handler | prefix `handle` | `handleSlotSelect`, `handleSubmit` |

### 3.3 React Components
| Type | Convention | Example |
|---|---|---|
| Component name | PascalCase | `TheaterCard` |
| Props interface | ComponentName + `Props` | `TheaterCardProps` |
| Context | PascalCase + `Context` | `BookingContext` |

### 3.4 Database (Prisma)
| Type | Convention | Example |
|---|---|---|
| Table name | snake_case | `theater`, `booking_addon` |
| Column name | snake_case | `is_active`, `base_price` |
| Prisma model name | PascalCase | `Theater`, `BookingAddon` |

### 3.5 API Endpoints
| Rule | Example |
|---|---|
| Plural nouns, lowercase | `/api/theaters`, `/api/bookings` |
| Kebab-case for multi-word | `/api/booking-addons` |
| Nested resource with parent ID | `/api/theaters/:id/slots` |
| Actions via sub-path (not verbs in noun route) | `/api/bookings/:id/cancel` |

---

## 4. TypeScript Rules

### 4.1 Strictness
The `tsconfig.json` must have:
```json
{
  "compilerOptions": {
    "strict": true,           // Enables all strict checks
    "noImplicitAny": true,    // No implicit any types
    "noUnusedLocals": true,   // Fail on unused variables
    "noUnusedParameters": true // Fail on unused function params
  }
}
```

### 4.2 Typing Rules

```typescript
// ✅ CORRECT — always define prop types explicitly
interface TheaterCardProps {
  theater: Theater;        // imported type from types/theater.ts
  onSelect: (id: string) => void;
}

// ❌ WRONG — never use 'any'
const fetchData = async (): Promise<any> => { ... }

// ✅ CORRECT — type the return value
const fetchData = async (): Promise<Theater[]> => { ... }

// ❌ WRONG — inline object types in component signatures
const TheaterCard = ({ theater }: { theater: any }) => { ... }

// ✅ CORRECT — always use a named interface
const TheaterCard = ({ theater }: TheaterCardProps) => { ... }

// ❌ WRONG — type assertion without reason
const result = response.data as Theater;

// ✅ CORRECT — validate with Zod at API boundary, then trust the type
const validated = TheaterSchema.parse(response.data); // Zod validates
```

### 4.3 Shared Types
- All shared types live in `/types/` (frontend) or are imported from a shared package
- API request/response types are defined in `types/api.ts` and used on both frontend and backend
- Never re-define a type — import it

---

## 5. Component Rules (React / Next.js)

### 5.1 Component Size
- **Max 150 lines** per component file
- If a component grows beyond 150 lines, extract sub-components
- Each component does **one thing** (single responsibility)

### 5.2 Component Structure (Order of code within a file)

```typescript
// 1. Imports — external libs first, then internal
import React from 'react';
import { motion } from 'framer-motion';
import { TheaterCardProps } from '@/types/theater';
import { formatCurrency } from '@/lib/formatters';
import { SlotPicker } from '@/components/booking/SlotPicker';

// 2. Type/interface definitions for this file only
interface InternalState {
  isExpanded: boolean;
}

// 3. Constants local to this component
const ANIMATION_DURATION = 0.3;

// 4. The component itself
export const TheaterCard = ({ theater, onSelect }: TheaterCardProps) => {
  // 4a. Hooks — always at the top, never conditional
  const [isExpanded, setIsExpanded] = React.useState(false);

  // 4b. Derived values (computed from props/state)
  const displayPrice = formatCurrency(theater.basePrice);

  // 4c. Handlers
  const handleSelectClick = () => {
    onSelect(theater.id);
  };

  // 4d. JSX return
  return (
    <div>...</div>
  );
};

// 5. Default export (if needed — prefer named exports)
export default TheaterCard;
```

### 5.3 Props Rules
- Always destructure props in the function signature
- Never mutate props
- Provide default values for optional props inline

```typescript
// ✅ CORRECT
const StarRating = ({
  rating,
  maxStars = 5,              // default value inline
  readOnly = false,
}: StarRatingProps) => { ... }
```

### 5.4 Server vs Client Components (Next.js)
- **Default to Server Components** — they're faster and better for SEO
- Add `'use client'` only when the component needs:
  - React state (`useState`, `useReducer`)
  - React effects (`useEffect`)
  - Browser APIs (window, localStorage)
  - Event listeners
- Comment why a component is a Client Component:

```typescript
'use client';
// Client Component: needs useState for slot selection interaction
```

### 5.5 No Anonymous Default Exports
```typescript
// ❌ WRONG — hard to debug, can't be easily refactored
export default () => <div>Hello</div>;

// ✅ CORRECT — named, traceable
export const HomePage = () => <div>Hello</div>;
export default HomePage;
```

---

## 6. Commenting Standards

> Clear commenting is a first-class requirement in this project. Every non-obvious line gets a comment.

### 6.1 File Header Comment
Every file starts with a header describing its purpose:

```typescript
/**
 * TheaterCard.tsx
 *
 * Displays a single theater with its specs, capacity, pricing, and a
 * "Book Now" CTA. Used on both the /theaters listing page and the
 * individual location page.
 *
 * Props:
 *   - theater: Full theater data object
 *   - onSelect: Callback when user clicks "Book Now"
 */
```

### 6.2 Function / Hook Comment
Every exported function or hook has a JSDoc comment:

```typescript
/**
 * Calculates the total booking price including base price,
 * extra person charges, selected add-ons, and applicable discounts.
 *
 * @param basePrice     - Theater's base price for base_capacity people
 * @param extraAdults   - Number of adults beyond base_capacity
 * @param extraChildren - Number of children (3–12 yrs) beyond base_capacity
 * @param addons        - Array of selected add-on items with prices
 * @param couponValue   - Flat discount amount from coupon (0 if none)
 * @returns             - Final total in INR (integer, paise not used)
 */
export const calculateBookingTotal = (
  basePrice: number,
  extraAdults: number,
  extraChildren: number,
  addons: AddonItem[],
  couponValue: number,
): number => { ... }
```

### 6.3 Inline Comments — Line-by-Line for Non-Obvious Logic

```typescript
const lockSlot = async (theaterId: string, date: string, slotId: string) => {
  // Build the Redis key using a consistent pattern: lock:{theater}:{date}:{slot}
  const lockKey = `lock:${theaterId}:${date}:${slotId}`;

  // Check if this slot is already locked by another session
  const existingLock = await redis.get(lockKey);

  // If a lock exists, another user is mid-booking — reject immediately
  if (existingLock) {
    throw new ConflictError('This slot is currently being booked by another user.');
  }

  // Lock the slot for 600 seconds (10 minutes) — enough time to complete checkout
  // TTL auto-releases the lock if the user abandons without paying
  await redis.setex(lockKey, 600, JSON.stringify({ lockedAt: new Date() }));
};
```

### 6.4 Section Dividers
For longer files, use section dividers to group related logic:

```typescript
// ─────────────────────────────────────────────
// SLOT AVAILABILITY HELPERS
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// PRICE CALCULATION HELPERS
// ─────────────────────────────────────────────
```

### 6.5 What NOT to Comment
```typescript
// ❌ Don't comment obvious code — it's noise
const i = 0; // Set i to zero

// ❌ Don't leave placeholder comments in committed code
// TODO: fix this later

// ✅ DO comment the WHY, not the WHAT
// Using setex instead of set to guarantee TTL is always applied.
// A plain set without TTL would cause stale locks on server crash.
await redis.setex(lockKey, 600, value);
```

---

## 7. API & Backend Rules

### 7.1 Layer Responsibilities
```
Route    → Only defines the HTTP method, path, and middleware chain.
           No business logic. No DB calls. Just: validate → controller.

Controller → Reads req, calls service, sends res.
             No business logic. No DB calls.

Service    → All business logic lives here. No HTTP concepts (req/res).
             Calls Prisma / Redis / external APIs.
             Throws typed errors that the error handler catches.
```

### 7.2 Route Example (Correct Pattern)

```typescript
// routes/theaters.ts
import { Router } from 'express';
import { getTheaters, getTheaterById } from '../controllers/theaters.controller';
import { validate } from '../middleware/validate.middleware';
import { GetTheatersSchema } from '../validators/theaters.validator';

const router = Router();

// GET /api/theaters — list all active theaters, optionally filtered by location
router.get('/', validate(GetTheatersSchema), getTheaters);

// GET /api/theaters/:id — get single theater details with specs and gallery
router.get('/:id', getTheaterById);

export default router;
```

### 7.3 Controller Example (Correct Pattern)

```typescript
// controllers/theaters.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TheatersService } from '../services/theaters.service';

// Handles GET /api/theaters
// Returns list of active theaters, filtered by location if query param provided
export const getTheaters = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Delegate all business logic to the service layer
    const theaters = await TheatersService.getAll(req.query.location as string);

    // Return standardized success response
    res.json({ success: true, data: theaters });
  } catch (error) {
    // Pass errors to the global error handler middleware
    next(error);
  }
};
```

### 7.4 Standardized API Response Format
All API responses follow this structure:

```typescript
// Success
{ "success": true, "data": { ... } }

// Success with pagination
{ "success": true, "data": [...], "meta": { "total": 100, "page": 1, "limit": 20 } }

// Error
{ "success": false, "error": { "code": "SLOT_LOCKED", "message": "This slot is unavailable." } }
```

### 7.5 HTTP Status Codes
| Scenario | Code |
|---|---|
| Success (data returned) | 200 |
| Resource created | 201 |
| No content (delete success) | 204 |
| Bad request / validation fail | 400 |
| Unauthorized (no token) | 401 |
| Forbidden (wrong role) | 403 |
| Not found | 404 |
| Conflict (slot taken) | 409 |
| Internal server error | 500 |

---

## 8. Database & Prisma Rules

### 8.1 Singleton Pattern for Prisma Client
Never instantiate `PrismaClient` more than once (causes connection pool exhaustion):

```typescript
// prisma/client.ts
// Singleton Prisma client — imported everywhere DB access is needed.
// In development, attaches to global to survive hot-reload.
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'], // Only log errors in production
  });

if (process.env.NODE_ENV !== 'production') {
  // Attach to global in dev so HMR doesn't create new connections on every reload
  globalForPrisma.prisma = prisma;
}
```

### 8.2 Query Rules
- Always `select` only the fields you need — never `findMany()` without a `select`
- Always set `where: { is_active: true }` for public queries (never return soft-deleted data)
- Use `include` sparingly — avoid deeply nested includes (max 2 levels)
- Use transactions for operations that must succeed or fail together

```typescript
// ✅ CORRECT — select only needed fields
const theaters = await prisma.theater.findMany({
  where: { location_id: locationId, is_active: true },
  select: {
    id: true,
    name: true,
    screen_size: true,
    base_price: true,
    max_capacity: true,
    images: true,
  },
  orderBy: { sort_order: 'asc' },
});

// ❌ WRONG — fetches every column including unused ones
const theaters = await prisma.theater.findMany();
```

### 8.3 Migration Rules
- Never edit a migration file after it has been applied
- Every schema change goes through `prisma migrate dev`
- Migration names must be descriptive: `add_couple_only_flag_to_theaters`

---

## 9. State Management Rules

### 9.1 When to Use What
| State Type | Solution |
|---|---|
| Server data (theaters, bookings from API) | React Query (TanStack Query) |
| Multi-step booking wizard state | Zustand (`bookingStore`) |
| Auth state (customer JWT, user info) | Zustand (`authStore`) + HttpOnly cookie |
| Local UI state (modal open, tab active) | `useState` in the component |
| URL-driven state (filters, pagination) | `useSearchParams` (Next.js) |

### 9.2 Zustand Store Rules

```typescript
// store/bookingStore.ts
/**
 * bookingStore.ts
 *
 * Manages the multi-step booking wizard state.
 * Persists to sessionStorage so browser refresh doesn't lose progress.
 *
 * Actions follow the pattern: set{FieldName}
 * Reset action clears all state when booking is completed or abandoned.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BookingState } from '@/types/booking';

interface BookingStore extends BookingState {
  // Setters — one per step to keep actions focused
  setTheater: (theaterId: string) => void;
  setSlot: (date: string, slotId: string, duration: 'standard' | 'short') => void;
  setOccasion: (occasion: string, occasionName: string) => void;
  setCake: (cakeId: string | null) => void;
  setAddons: (addonIds: string[]) => void;
  setFoodItems: (items: FoodOrderItem[]) => void;

  // Resets the entire booking state when flow is completed or abandoned
  resetBooking: () => void;
}

const initialState: BookingState = {
  theaterId: null,
  date: null,
  slotId: null,
  duration: 'standard',
  occasion: null,
  occasionName: '',
  cakeId: null,
  addonIds: [],
  foodItems: [],
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Each setter merges only its own fields, leaving others unchanged
      setTheater: (theaterId) => set({ theaterId }),
      setSlot: (date, slotId, duration) => set({ date, slotId, duration }),
      setOccasion: (occasion, occasionName) => set({ occasion, occasionName }),
      setCake: (cakeId) => set({ cakeId }),
      setAddons: (addonIds) => set({ addonIds }),
      setFoodItems: (foodItems) => set({ foodItems }),

      // Full reset — called after successful payment or user abandons
      resetBooking: () => set(initialState),
    }),
    {
      name: 'booking-state',                           // sessionStorage key
      storage: createJSONStorage(() => sessionStorage), // NOT localStorage — booking is session-specific
    },
  ),
);
```

---

## 10. CSS & Styling Rules

### 10.1 Tailwind-First
- Use Tailwind utility classes for all styling
- Never write raw CSS unless Tailwind cannot achieve the effect
- If you find yourself repeating the same Tailwind class combination 3+ times, extract it into a component

### 10.2 Responsive Design
- Mobile-first: write base styles for mobile, add `md:` and `lg:` breakpoints for larger screens
- Every component must be tested at 375px (mobile), 768px (tablet), 1280px (desktop)

### 10.3 Dark Theme
- The site uses a dark cinema theme — all backgrounds should be dark
- Use CSS variables for colors so theming is consistent:

```css
/* In globals.css */
:root {
  --color-bg-primary: #0D0D0D;      /* Main background */
  --color-bg-surface: #1A1A1A;      /* Cards, panels */
  --color-text-primary: #F5F5F5;    /* Primary text */
  --color-text-muted: #9CA3AF;      /* Secondary text */
  --color-accent: #D4A017;          /* Gold accent — TBD based on branding */
}
```

### 10.4 No Inline Styles
```tsx
// ❌ WRONG
<div style={{ color: 'red', padding: '16px' }}>

// ✅ CORRECT
<div className="text-red-500 p-4">
```

---

## 11. Error Handling Rules

### 11.1 Custom Error Classes (Backend)

```typescript
// utils/errors.ts
// Base class for all application-level errors.
// Carries an HTTP status code so the error handler can respond correctly.
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,       // Machine-readable error code for the frontend
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 404 — resource not found
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found.`, 404, 'NOT_FOUND');
  }
}

// 409 — conflict, e.g., slot already locked
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

// 400 — validation failure
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

### 11.2 Global Error Handler (Backend)

```typescript
// middleware/errorHandler.ts
// Catches all errors thrown or passed via next(error) in any route/controller.
// Ensures every error response follows the standard { success, error } shape.
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction, // must have 4 params for Express to treat this as error middleware
) => {
  // Log every error with request context for debugging
  logger.error({ error: error.message, path: req.path, method: req.method });

  // If it's one of our known AppErrors, use its status code and code
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }

  // Unknown error — don't leak internals to client, log the full error
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
};
```

### 11.3 Frontend Error Handling
- Every API call is wrapped in try/catch
- User-facing errors show a toast notification (not a raw alert)
- Network errors show a generic "Connection issue" message — never raw error objects

---

## 12. Testing Rules

### 12.1 What to Test
| Layer | Tool | What |
|---|---|---|
| Services (backend) | Vitest | Unit test all service functions |
| API routes (backend) | Supertest + Vitest | Integration test all endpoints |
| React components | React Testing Library | Test behavior, not implementation |
| Booking flow | Playwright | E2E test the full booking wizard |

### 12.2 Test File Location
- Backend: `src/services/__tests__/theaters.service.test.ts`
- Frontend: `components/theater/__tests__/TheaterCard.test.tsx`

### 12.3 Test Naming
```typescript
describe('TheatersService', () => {
  describe('getAll()', () => {
    it('returns only active theaters for a given location', async () => { ... });
    it('returns all theaters when no location filter is provided', async () => { ... });
    it('throws NotFoundError when location does not exist', async () => { ... });
  });
});
```

---

## 13. Git & Commit Rules

### 13.1 Branch Naming
```
feature/booking-wizard-step-1
fix/slot-lock-timeout-bug
chore/add-eslint-config
docs/update-api-endpoints
```

### 13.2 Commit Message Format (Conventional Commits)
```
<type>(<scope>): <short description>

type:  feat | fix | chore | docs | style | refactor | test
scope: booking | theaters | admin | auth | payment | whatsapp

Examples:
feat(booking): add slot lock mechanism with Redis TTL
fix(payment): handle Razorpay webhook signature mismatch
chore(deps): upgrade Prisma to 5.10.0
```

### 13.3 PR Rules
- Every PR must reference a GitHub issue
- Max 400 lines changed per PR (break larger features into smaller PRs)
- PR must pass all CI checks before merging
- At least 1 review required before merge to `main`

---

## 14. Security Rules

### 14.1 Environment Variables
- All secrets in `.env` files — never hardcoded in source
- `.env` files never committed — only `.env.example` is committed
- Env vars accessed only through `config/index.ts` which validates them at startup

```typescript
// config/index.ts
// Validates all required env vars at startup.
// App crashes immediately if a required var is missing — fail fast.
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  WATI_API_KEY: z.string(),
});

export const config = EnvSchema.parse(process.env);
```

### 14.2 Input Validation
- All incoming API data validated with Zod before it reaches the controller
- All user-facing form data validated with Zod on the frontend too
- Never trust client-provided IDs without DB lookup to verify ownership

### 14.3 Payment Webhook Security
- Always verify Razorpay webhook signature using `crypto.createHmac`
- Reject any webhook with invalid signature with `400 Bad Request`
- Never process a booking confirmation without verified payment data

### 14.4 Rate Limiting
- OTP endpoint: max 3 requests per phone number per 10 minutes
- Booking creation: max 5 requests per IP per minute
- Admin login: max 10 attempts per IP per hour, then lock for 30 minutes

---

## 15. Performance Rules

### 15.1 Images
- All theater images go through Cloudinary with transformation
- Always use `next/image` — never raw `<img>` tags
- Specify `width` and `height` on every image to prevent layout shift (CLS)
- Use `priority` only on above-the-fold images (hero image)

### 15.2 API Performance
- Theater list: cache in Redis for 5 minutes (data rarely changes)
- Slot availability: cache in Redis for 30 seconds (changes frequently)
- Use `select` in Prisma queries — never fetch unused columns

### 15.3 Bundle Size
- Run `next build` and inspect bundle analyzer output before each release
- Keep the initial JS payload under 200KB (gzipped)
- Lazy-load heavy components (gallery, admin charts) with `next/dynamic`

---

## 16. Error Logging Rules

> Logging is how we debug production issues without a debugger. Every error must leave a trace.
> Errors are logged in **two places simultaneously** — Winston (console/platform) for real-time visibility, and the **database** for permanent searchable history.

### 16.0 Two-Layer Error Storage Architecture

```
An error occurs in the app
        │
        ▼
┌───────────────────────────┐
│   Winston Logger          │  ← Real-time, ephemeral, streamed to Railway/Render logs
│   (console + platform)    │    Rotated after 30 days. Good for live tailing.
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│   error_logs DB table     │  ← Permanent, queryable, linked to error_master
│   (PostgreSQL)            │    Never deleted. Viewable in Admin Dashboard.
│                           │    Each row references a code from error_master.
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│   error_master DB table   │  ← Seed data table. Defines every known error code,
│   (PostgreSQL)            │    its severity, category, and resolution hint.
│                           │    Updated only via migrations — not by the app.
└───────────────────────────┘
```

### 16.1 Logger Setup (Winston)

One logger instance, shared across the entire backend. Never use `console.log` in production code.

```typescript
// utils/logger.ts
/**
 * logger.ts
 *
 * Centralized Winston logger for the entire backend.
 * - In development: pretty-prints to console with colors
 * - In production: outputs structured JSON to stdout (captured by Railway/Render)
 *
 * Import this everywhere you need logging. Never use console.log directly.
 */
import winston from 'winston';

// Define log levels from most to least severe
// error > warn > info > debug
const LOG_LEVELS = {
  error: 0, // Unhandled exceptions, payment failures, DB connection loss
  warn: 1,  // Recoverable issues — retried operations, deprecated usage
  info: 2,  // Normal significant events — booking created, payment received
  debug: 3, // Detailed flow info — only emitted in development
};

// JSON format for production — structured logs are queryable in log platforms
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),   // Adds ISO timestamp to every log entry
  winston.format.errors({ stack: true }), // Includes stack trace on error objects
  winston.format.json(),        // Outputs as JSON — easy to parse in log tools
);

// Pretty format for local development — human-readable with colors
const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) =>
    // meta contains any extra context fields passed to the log call
    `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`,
  ),
);

export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  // Only log debug in dev — avoids noise in production
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? jsonFormat : prettyFormat,
  transports: [
    // Always write to stdout — the hosting platform captures it
    new winston.transports.Console(),
  ],
});
```

---

### 16.2 What to Log at Each Level

| Level | When to Use | Example |
|---|---|---|
| `error` | Unhandled exceptions, payment failures, DB errors, webhook failures | Payment webhook signature mismatch |
| `warn` | Recoverable issues — slot lock expired, OTP resend requested | OTP resend limit approaching |
| `info` | Key business events — booking created, payment success, cancellation | Booking #ABC123 confirmed |
| `debug` | Detailed tracing for development only — request params, query results | Theater query returned 6 results |

---

### 16.3 What Every Error Log Must Include

Every `logger.error()` call must include these fields:

```typescript
// ✅ CORRECT — structured log with full context
logger.error('Payment webhook processing failed', {
  event:      'payment.webhook',        // What action was being performed
  gateway:    'razorpay',               // Which external system was involved
  bookingId:  booking.id,               // Which resource was affected
  error:      error.message,            // Human-readable error description
  stack:      error.stack,              // Full stack trace for debugging
  requestId:  req.headers['x-request-id'], // Tie log to the original HTTP request
});

// ❌ WRONG — tells us nothing useful in production
logger.error('Something went wrong');
console.log(error);
```

---

### 16.4 Request ID Propagation

Every HTTP request gets a unique ID. This ID is attached to all log entries within that request's lifecycle so you can trace the full flow of any single request.

```typescript
// middleware/requestId.middleware.ts
/**
 * Assigns a unique UUID to every incoming request.
 * Stored in res.locals so it's accessible in all downstream middleware and controllers.
 * Also sent back in the response header so clients can reference it in support tickets.
 */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use client-provided ID if present (useful for frontend tracing), else generate a new one
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();

  // Store in res.locals so controllers and services can read it
  res.locals.requestId = requestId;

  // Echo it back in the response — client can use this in support queries
  res.setHeader('x-request-id', requestId);

  next();
};
```

---

### 16.5 Log What You Promise to Fix

```typescript
// ❌ WRONG — logging an error you're going to silently swallow
try {
  await sendWhatsappMessage(phone, message);
} catch (error) {
  logger.error('WhatsApp failed', { error });
  // nothing else — booking still proceeds silently
}

// ✅ CORRECT — log, alert if critical, then decide whether to throw or continue
try {
  await sendWhatsappMessage(phone, message);
} catch (error) {
  // WhatsApp failure is non-critical — booking is already confirmed.
  // Log as warn (not error) because the core flow succeeded.
  // The cron job will retry the notification.
  logger.warn('WhatsApp confirmation message failed — will retry via cron', {
    event:     'whatsapp.confirmation.failed',
    bookingId: booking.id,
    phone:     phone,
    error:     (error as Error).message,
  });
}
```

---

### 16.6 Never Log Sensitive Data

```typescript
// ❌ NEVER log these — they end up in log files and monitoring dashboards
logger.info('OTP sent', { phone, otp: '4829' });        // OTP in plain text
logger.info('Payment processed', { cardNumber: '...' }); // Card data
logger.info('Admin login', { email, password });         // Credentials

// ✅ Log identifiers and outcomes, not secrets
logger.info('OTP sent successfully', { phone: maskPhone(phone) }); // Mask to +91****5678
logger.info('Payment processed', { bookingId, gateway: 'razorpay', amount });
logger.info('Admin login successful', { adminId, role });
```

**Phone masking helper:**
```typescript
// utils/formatters.ts
// Masks a phone number for safe logging — shows only last 4 digits
export const maskPhone = (phone: string): string =>
  phone.replace(/(\d+)(\d{4})$/, (_, hidden, last4) => '*'.repeat(hidden.length) + last4);
// maskPhone('+919948954545') → '+91*****4545'
```

---

### 16.7 Error Master Table

The `error_master` table is a **seed-data reference table**. It defines every known error code in the system — its human-readable description, severity, category, whether it is retryable, and a resolution hint for the developer.

**Rules:**
- Rows are inserted via Prisma seed / migration — **never inserted by the app at runtime**
- The app only **reads** this table to validate that a code exists and to enrich error log entries
- Adding a new error code = write a new migration that inserts the row

```sql
-- error_master table
-- Reference table for all known application error codes.
-- Seed-only: rows are never inserted or updated by the running application.

CREATE TABLE error_master (
  code          TEXT PRIMARY KEY,   -- Machine-readable, SCREAMING_SNAKE_CASE e.g. 'SLOT_ALREADY_LOCKED'
  http_status   SMALLINT NOT NULL,  -- Default HTTP status code for this error (400, 409, 500, etc.)
  severity      TEXT NOT NULL       -- 'low' | 'medium' | 'high' | 'critical'
                CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category      TEXT NOT NULL       -- 'auth' | 'booking' | 'payment' | 'theater' | 'system' | 'validation'
                CHECK (category IN ('auth', 'booking', 'payment', 'theater', 'system', 'validation')),
  message       TEXT NOT NULL,      -- Default user-facing message for this error
  description   TEXT NOT NULL,      -- Internal description: what caused it, what it means
  resolution    TEXT,               -- Developer hint: what to check / how to fix it
  is_retryable  BOOLEAN NOT NULL DEFAULT false, -- Can the client safely retry this request?
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Full Seed Data — All Error Codes for This Application:**

```sql
-- ─────────────────────────────────────────────
-- AUTH ERRORS
-- ─────────────────────────────────────────────
INSERT INTO error_master (code, http_status, severity, category, message, description, resolution, is_retryable) VALUES
('AUTH_OTP_INVALID',          400, 'low',    'auth',    'The OTP you entered is incorrect.',          'Customer entered a wrong OTP code.',                                        'Ask customer to re-enter or request a new OTP.', false),
('AUTH_OTP_EXPIRED',          400, 'low',    'auth',    'Your OTP has expired. Please request a new one.', 'OTP TTL (5 min) elapsed before verification.',                        'Customer must request a fresh OTP.',             false),
('AUTH_OTP_MAX_ATTEMPTS',     429, 'medium', 'auth',    'Too many incorrect attempts. Please wait 10 minutes.', 'Customer exceeded 3 wrong OTP attempts for a phone number.',     'Rate limit active. Wait for lockout to expire.',  false),
('AUTH_OTP_RATE_LIMITED',     429, 'medium', 'auth',    'Too many OTP requests. Please wait before trying again.', 'Phone number requested more than 3 OTPs in 10 minutes.',      'Rate limit on OTP sends. Wait window to pass.',   false),
('AUTH_TOKEN_MISSING',        401, 'low',    'auth',    'Authentication required.',                   'Request made to protected endpoint without a JWT.',                         'Frontend must include Authorization header.',      false),
('AUTH_TOKEN_INVALID',        401, 'low',    'auth',    'Session is invalid. Please log in again.',  'JWT signature verification failed or token malformed.',                     'Customer must re-authenticate.',                  false),
('AUTH_TOKEN_EXPIRED',        401, 'low',    'auth',    'Your session has expired. Please log in again.', 'JWT exp claim is in the past.',                                       'Frontend must refresh token or prompt re-login.', true),
('AUTH_ADMIN_INVALID_CREDS',  401, 'medium', 'auth',    'Incorrect email or password.',               'Admin login attempted with wrong credentials.',                             'Verify credentials. Check for caps lock.',        false),
('AUTH_ADMIN_LOCKED',         403, 'high',   'auth',    'Account locked due to too many failed attempts.', 'Admin account locked after 10 failed logins in 1 hour.',             'Wait 30 min or contact super admin to unlock.',   false),
('AUTH_INSUFFICIENT_ROLE',    403, 'medium', 'auth',    'You do not have permission to perform this action.', 'Admin with insufficient role tried a restricted action.',          'Check the role required for this endpoint.',      false);

-- ─────────────────────────────────────────────
-- BOOKING ERRORS
-- ─────────────────────────────────────────────
INSERT INTO error_master (code, http_status, severity, category, message, description, resolution, is_retryable) VALUES
('BOOKING_SLOT_LOCKED',       409, 'medium', 'booking', 'This slot is currently being booked by someone else. Please try a different slot or check back in a few minutes.', 'Redis slot lock held by another session.', 'Wait for the 10-min lock TTL or customer picks another slot.', true),
('BOOKING_SLOT_UNAVAILABLE',  409, 'medium', 'booking', 'This slot is no longer available.',          'Slot is fully booked (confirmed booking exists in DB).',                    'Customer must select a different date or slot.',  false),
('BOOKING_SLOT_NOT_FOUND',    404, 'low',    'booking', 'The selected slot does not exist.',           'slot_id provided does not exist in the time_slots table.',                  'Verify the slot ID sent by the frontend.',        false),
('BOOKING_THEATER_NOT_FOUND', 404, 'low',    'booking', 'Theater not found.',                         'theater_id provided does not exist or is_active = false.',                  'Check the theater ID. May have been deactivated.', false),
('BOOKING_CAPACITY_EXCEEDED', 400, 'low',    'booking', 'The number of guests exceeds this theater\'s capacity.', 'Total headcount > theater.max_capacity.',                     'Customer must reduce guest count.',               false),
('BOOKING_COUPLE_ONLY',       400, 'low',    'booking', 'This theater is for couples only (max 2 guests).', 'Non-couple booking attempted on a couple-only theater.',            'Customer must choose a different theater.',       false),
('BOOKING_NO_EXTRA_PERSONS',  400, 'low',    'booking', 'This theater does not allow additional guests beyond the base capacity.', 'Extra persons requested for a theater with allow_extra_persons = false.', 'Customer must reduce to base capacity.', false),
('BOOKING_NOT_FOUND',         404, 'low',    'booking', 'Booking not found.',                         'booking_id provided does not exist.',                                       'Verify the booking ID.',                          false),
('BOOKING_ALREADY_CANCELLED', 409, 'low',    'booking', 'This booking has already been cancelled.',   'Cancel requested on a booking with status = cancelled.',                    'No action needed — already cancelled.',           false),
('BOOKING_CANCEL_WINDOW_CLOSED', 400, 'low', 'booking', 'Cancellation is not allowed within 72 hours of the slot.', 'Customer tried to cancel inside the 72-hour no-refund window.', 'Inform customer of the cancellation policy.',   false),
('BOOKING_LOCK_EXPIRED',      409, 'medium', 'booking', 'Your session timed out. Please start your booking again.', 'Slot lock TTL expired before payment was completed.',         'Customer must restart the booking flow.',         false),
('BOOKING_COUPON_INVALID',    400, 'low',    'booking', 'This coupon code is not valid.',              'Coupon code does not exist in the coupons table.',                          'Verify the coupon code.',                         false),
('BOOKING_COUPON_EXPIRED',    400, 'low',    'booking', 'This coupon has expired.',                   'Coupon valid_until date is in the past.',                                   'Customer must use a valid coupon.',               false),
('BOOKING_COUPON_MAX_USED',   400, 'low',    'booking', 'This coupon has reached its usage limit.',   'Coupon used_count >= max_uses.',                                            'Disable or increase limit from admin panel.',     false),
('BOOKING_COUPON_MIN_AMOUNT', 400, 'low',    'booking', 'Your booking total does not meet the minimum amount for this coupon.', 'Booking total < coupon.min_amount.',               'Customer must add more to qualify.',              false);

-- ─────────────────────────────────────────────
-- PAYMENT ERRORS
-- ─────────────────────────────────────────────
INSERT INTO error_master (code, http_status, severity, category, message, description, resolution, is_retryable) VALUES
('PAYMENT_ORDER_FAILED',      502, 'high',   'payment', 'Could not initiate payment. Please try again.', 'Razorpay/PhonePe order creation API call failed.',                      'Check gateway API keys and network. Retry.',      true),
('PAYMENT_WEBHOOK_INVALID_SIG', 400, 'critical', 'payment', 'Invalid webhook signature.', 'Incoming webhook HMAC signature does not match. Possible spoofed request.',             'Check webhook secret config. Investigate source IP.', false),
('PAYMENT_WEBHOOK_DUPLICATE', 409, 'low',    'payment', 'Duplicate webhook event received.',           'Webhook event already processed (idempotency check failed).',               'Safe to ignore — already handled.',              false),
('PAYMENT_NOT_FOUND',         404, 'medium', 'payment', 'Payment record not found.',                   'payment_id provided does not exist in DB.',                                 'Verify the payment ID.',                          false),
('PAYMENT_ALREADY_CAPTURED',  409, 'low',    'payment', 'This payment has already been captured.',     'Attempted to capture a payment that is already in captured state.',         'No action needed.',                               false),
('PAYMENT_REFUND_FAILED',     502, 'high',   'payment', 'Refund could not be processed. Our team will contact you.', 'Razorpay/PhonePe refund API call failed.',                'Manually process refund from gateway dashboard.', true),
('PAYMENT_AMOUNT_MISMATCH',   400, 'critical', 'payment', 'Payment amount does not match booking total.', 'Amount received from webhook differs from expected advance amount.',    'Investigate immediately — possible fraud attempt.', false);

-- ─────────────────────────────────────────────
-- THEATER / ADD-ON ERRORS
-- ─────────────────────────────────────────────
INSERT INTO error_master (code, http_status, severity, category, message, description, resolution, is_retryable) VALUES
('THEATER_NOT_FOUND',         404, 'low',    'theater', 'Theater not found.',                         'theater_id does not exist or theater is inactive.',                         'Verify theater ID. Check is_active flag.',        false),
('THEATER_SLUG_EXISTS',       409, 'low',    'theater', 'A theater with this name already exists.',   'Duplicate slug detected during theater creation.',                          'Use a different theater name.',                   false),
('LOCATION_NOT_FOUND',        404, 'low',    'theater', 'Location not found.',                        'location_id does not exist or location is inactive.',                       'Verify location ID.',                             false),
('ADDON_NOT_FOUND',           404, 'low',    'theater', 'Add-on item not found.',                     'addon_id provided does not exist or is inactive.',                          'Verify add-on ID.',                               false),
('FOOD_ITEM_NOT_FOUND',       404, 'low',    'theater', 'Food item not found.',                       'food_item_id does not exist or is unavailable.',                            'Verify food item ID. May have been removed.',     false);

-- ─────────────────────────────────────────────
-- VALIDATION ERRORS
-- ─────────────────────────────────────────────
INSERT INTO error_master (code, http_status, severity, category, message, description, resolution, is_retryable) VALUES
('VALIDATION_FAILED',         400, 'low',    'validation', 'Invalid request data.',                    'Zod schema validation on the request body/query failed.',                   'Check the errors array in the response for details.', false),
('INVALID_DATE_FORMAT',       400, 'low',    'validation', 'Invalid date format. Please use YYYY-MM-DD.', 'Date string could not be parsed.',                                     'Ensure frontend sends ISO date format.',          false),
('INVALID_PHONE_NUMBER',      400, 'low',    'validation', 'Please enter a valid 10-digit Indian mobile number.', 'Phone number failed regex validation.',                        'Validate phone on frontend before sending.',      false);

-- ─────────────────────────────────────────────
-- SYSTEM / INFRASTRUCTURE ERRORS
-- ─────────────────────────────────────────────
INSERT INTO error_master (code, http_status, severity, category, message, description, resolution, is_retryable) VALUES
('DB_CONNECTION_FAILED',      503, 'critical', 'system', 'Service temporarily unavailable. Please try again shortly.', 'Prisma cannot connect to PostgreSQL.',                    'Check DB connection string and Supabase status.',  true),
('REDIS_CONNECTION_FAILED',   503, 'critical', 'system', 'Service temporarily unavailable.',           'Redis client cannot connect.',                                             'Check Redis URL and Upstash status.',              true),
('WHATSAPP_SEND_FAILED',      502, 'medium',  'system',  'Could not send WhatsApp notification.',      'WATI API call returned an error.',                                         'Check WATI API key and phone number format.',      true),
('FILE_UPLOAD_FAILED',        502, 'medium',  'system',  'Image upload failed. Please try again.',     'Cloudinary upload API returned an error.',                                  'Check Cloudinary credentials and file size.',      true),
('RATE_LIMIT_EXCEEDED',       429, 'medium',  'system',  'Too many requests. Please slow down.',       'express-rate-limit threshold hit for the client IP.',                      'Inform client to back off. Check for abuse.',      true),
('INTERNAL_ERROR',            500, 'critical', 'system', 'Something went wrong on our end. Please try again.', 'Unclassified exception caught by the global error handler.',      'Check error_logs table for stack trace.',          true),
('ERROR_CODE_UNKNOWN',        500, 'high',    'system',  'An unexpected error occurred.',              'AppError thrown with a code that does not exist in error_master.',          'Add the missing code to error_master seed data.',  false);
```

---

### 16.8 Error Log Table

Every error that hits the global error handler is written to this table. This is what the admin dashboard's "Error Logs" view queries.

```sql
-- error_logs table
-- Stores every application error occurrence permanently.
-- Written by ErrorLogService — never written directly by business code.

CREATE TABLE error_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the error master — tells us everything about this error type
  error_code    TEXT NOT NULL REFERENCES error_master(code),

  -- Severity snapshot at the time of the error (denormalized for fast filtering)
  severity      TEXT NOT NULL,  -- Copied from error_master at insert time

  -- Full error message as thrown (may differ from the master's default message)
  message       TEXT NOT NULL,

  -- Stack trace from the Error object — critical for debugging
  stack_trace   TEXT,

  -- Request context — helps reproduce and investigate the error
  request_id    TEXT,           -- From x-request-id header
  request_path  TEXT,           -- e.g. '/api/bookings'
  request_method TEXT,          -- e.g. 'POST'
  request_body  JSONB,          -- Sanitized request body (secrets stripped)

  -- Who was affected
  actor_type    TEXT,           -- 'customer' | 'admin' | 'system' | null
  actor_id      TEXT,           -- customer.id or admin.id if known
  ip_address    TEXT,

  -- Business context — which resource was being operated on
  resource_type TEXT,           -- e.g. 'booking', 'theater'
  resource_id   TEXT,           -- e.g. booking UUID

  -- Extra arbitrary context from the throw site
  metadata      JSONB,

  -- Whether this has been acknowledged/resolved by the team
  is_resolved   BOOLEAN NOT NULL DEFAULT false,
  resolved_by   TEXT,           -- admin.id who marked it resolved
  resolved_at   TIMESTAMPTZ,
  resolution_note TEXT,         -- What was done to fix it

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for the admin dashboard query patterns
CREATE INDEX idx_error_logs_code      ON error_logs (error_code);
CREATE INDEX idx_error_logs_severity  ON error_logs (severity);
CREATE INDEX idx_error_logs_created   ON error_logs (created_at DESC);
CREATE INDEX idx_error_logs_resolved  ON error_logs (is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_error_logs_request   ON error_logs (request_id);
```

---

### 16.9 ErrorLogService

The single service responsible for writing to `error_logs`. Called inside the global error handler — never called directly from business code.

```typescript
// services/errorLog.service.ts
/**
 * errorLog.service.ts
 *
 * Writes error occurrences to the error_logs DB table.
 * Called exclusively by the global error handler middleware.
 *
 * Rules:
 *   - Fire-and-forget (no await) — must never block the error response to the client
 *   - If the DB write itself fails, fall back to Winston only (never throw from here)
 *   - Strips sensitive fields from request body before storing (passwords, OTPs, card data)
 */
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';

// Defines the shape of context passed from the error handler
interface ErrorLogEntry {
  errorCode:     string;
  severity:      string;
  message:       string;
  stackTrace?:   string;
  requestId?:    string;
  requestPath?:  string;
  requestMethod?: string;
  requestBody?:  Record<string, unknown>;
  actorType?:    string;
  actorId?:      string;
  ipAddress?:    string;
  resourceType?: string;
  resourceId?:   string;
  metadata?:     Record<string, unknown>;
}

// Fields that must never be stored in the DB — scrub them from request bodies
const SENSITIVE_FIELDS = ['password', 'otp', 'token', 'cardNumber', 'cvv', 'secret'];

export class ErrorLogService {
  /**
   * Persists an error occurrence to the error_logs table.
   * Fire-and-forget — the caller does NOT await this.
   *
   * @param entry - Structured error context collected by the error handler
   */
  static log(entry: ErrorLogEntry): void {
    // Strip sensitive keys from request body before storing in DB
    const sanitizedBody = entry.requestBody
      ? ErrorLogService.sanitizeBody(entry.requestBody)
      : undefined;

    // Write to DB without blocking — errors here fall back to Winston
    prisma.errorLog
      .create({
        data: {
          error_code:     entry.errorCode,
          severity:       entry.severity,
          message:        entry.message,
          stack_trace:    entry.stackTrace   ?? null,
          request_id:     entry.requestId    ?? null,
          request_path:   entry.requestPath  ?? null,
          request_method: entry.requestMethod ?? null,
          request_body:   sanitizedBody      ?? {},
          actor_type:     entry.actorType    ?? null,
          actor_id:       entry.actorId      ?? null,
          ip_address:     entry.ipAddress    ?? null,
          resource_type:  entry.resourceType ?? null,
          resource_id:    entry.resourceId   ?? null,
          metadata:       entry.metadata     ?? {},
        },
      })
      .catch((dbError) => {
        // DB write for error logging itself failed.
        // Log to Winston as a last resort — do not throw.
        logger.error('ErrorLogService: failed to persist error log to DB', {
          event:         'error_log.db_write_failed',
          originalCode:  entry.errorCode,
          dbError:       (dbError as Error).message,
        });
      });
  }

  /**
   * Removes sensitive fields from a request body object before it is stored in the DB.
   * Operates recursively on nested objects.
   *
   * @param body - Raw request body from Express
   * @returns    - A new object with sensitive keys replaced by '[REDACTED]'
   */
  private static sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(body).map(([key, value]) => {
        // If this key is in the sensitive list, redact the value entirely
        if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
          return [key, '[REDACTED]'];
        }
        // If the value is a nested object, recurse into it
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return [key, ErrorLogService.sanitizeBody(value as Record<string, unknown>)];
        }
        return [key, value];
      }),
    );
  }
}
```

---

### 16.10 Updated Global Error Handler (DB-Integrated)

The error handler now resolves the error code against `error_master`, writes to `error_logs`, AND fires Winston — all in the right order.

```typescript
// middleware/errorHandler.ts
/**
 * errorHandler.ts
 *
 * Global Express error handler — the last middleware in the chain.
 * Every error thrown or passed via next(error) arrives here.
 *
 * Responsibilities (in order):
 *   1. Determine the error code (from AppError, or default INTERNAL_ERROR)
 *   2. Log to Winston immediately (synchronous — guaranteed to run)
 *   3. Persist to error_logs table via ErrorLogService (async, fire-and-forget)
 *   4. Send standardized JSON response to the client
 *
 * This handler must NEVER throw. Any failure inside it is swallowed after logging.
 */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ErrorLogService } from '../services/errorLog.service';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction, // 4-param signature required for Express to treat this as error middleware
): void => {
  // ── Step 1: Resolve error code and HTTP status ──────────────────────────
  // Use the code from AppError if available; fall back to INTERNAL_ERROR for unknowns
  const errorCode  = error instanceof AppError ? error.code       : 'INTERNAL_ERROR';
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const severity   = error instanceof AppError ? error.severity   : 'critical';

  // ── Step 2: Log to Winston — immediate, synchronous ──────────────────────
  // This runs first so that even if DB write fails, we always have a log trail
  logger.error(error.message, {
    event:         'unhandled_error',
    errorCode,
    severity,
    requestId:     res.locals.requestId,   // Set by requestIdMiddleware
    path:          req.path,
    method:        req.method,
    actorId:       res.locals.userId ?? null,
    stack:         error.stack,
  });

  // ── Step 3: Persist to error_logs DB — async, fire-and-forget ───────────
  // Never await — must not delay the response to the client
  ErrorLogService.log({
    errorCode,
    severity,
    message:       error.message,
    stackTrace:    error.stack,
    requestId:     res.locals.requestId,
    requestPath:   req.path,
    requestMethod: req.method,
    requestBody:   req.body as Record<string, unknown>,
    actorType:     res.locals.userType  ?? undefined,   // 'customer' | 'admin' | undefined
    actorId:       res.locals.userId    ?? undefined,
    ipAddress:     req.ip,
    // Resource context is optionally attached by services that throw AppError
    resourceType:  error instanceof AppError ? error.resourceType : undefined,
    resourceId:    error instanceof AppError ? error.resourceId   : undefined,
    metadata:      error instanceof AppError ? error.metadata     : undefined,
  });

  // ── Step 4: Send standardized response to client ────────────────────────
  // Never leak stack traces or internal messages to the client in production
  res.status(statusCode).json({
    success:   false,
    requestId: res.locals.requestId,   // Client includes this in support tickets
    error: {
      code:    errorCode,
      message: error instanceof AppError
        ? error.message
        : 'Something went wrong on our end. Please try again.',
    },
  });
};
```

---

### 16.11 Updated AppError Class

`AppError` now carries `severity`, optional `resourceType`/`resourceId`, and `metadata` so the error handler can pass rich context to `ErrorLogService` without reaching back into the request.

```typescript
// utils/errors.ts
/**
 * errors.ts
 *
 * Application error classes. All intentional errors thrown by services
 * must use one of these classes (or a subclass).
 *
 * The error code MUST exist in the error_master table.
 * If you add a new error class with a new code, add the seed row to error_master first.
 */

// Base class for all known application errors
export class AppError extends Error {
  constructor(
    public message:       string,   // User-facing message
    public statusCode:    number,   // HTTP status
    public code:          string,   // Must match error_master.code
    public severity:      'low' | 'medium' | 'high' | 'critical' = 'medium',
    public resourceType?: string,   // Optional: which entity was involved
    public resourceId?:   string,   // Optional: which entity ID was involved
    public metadata?:     Record<string, unknown>, // Optional: extra context
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 404 — resource not found
export class NotFoundError extends AppError {
  constructor(resource: string, resourceId?: string) {
    // Builds code like 'BOOKING_NOT_FOUND' from resource name 'booking'
    super(
      `${resource} not found.`,
      404,
      `${resource.toUpperCase().replace(/ /g, '_')}_NOT_FOUND`,
      'low',
      resource.toLowerCase(),
      resourceId,
    );
  }
}

// 409 — conflict, e.g., slot already locked or booked
export class ConflictError extends AppError {
  constructor(code: string, message: string, resourceType?: string, resourceId?: string) {
    super(message, 409, code, 'medium', resourceType, resourceId);
  }
}

// 400 — business rule or validation violation
export class ValidationError extends AppError {
  constructor(code: string, message: string) {
    super(message, 400, code, 'low');
  }
}

// 403 — authenticated but not authorized
export class ForbiddenError extends AppError {
  constructor(code: string = 'AUTH_INSUFFICIENT_ROLE') {
    super('You do not have permission to perform this action.', 403, code, 'medium');
  }
}

// 502 — external service failed (payment gateway, WhatsApp, Cloudinary)
export class ExternalServiceError extends AppError {
  constructor(code: string, message: string, metadata?: Record<string, unknown>) {
    super(message, 502, code, 'high', undefined, undefined, metadata);
  }
}
```

---

### 16.12 Admin Dashboard — Error Logs View

The admin dashboard exposes a dedicated **Error Logs** page at `/admin/error-logs` with:

| Feature | Detail |
|---|---|
| Table view | All unresolved errors, newest first |
| Columns | Timestamp, Error Code, Severity (color-coded), Path, Actor, Request ID |
| Filters | Severity, Category (from error_master), Date range, Resolved / Unresolved |
| Detail view | Full stack trace, request body (sanitized), metadata, resolution notes |
| Mark resolved | Admin can mark an error as resolved with a note |
| Error frequency | Count of occurrences per error code in the last 7 / 30 days |
| Critical alerts | `critical` severity errors shown as a banner at top of admin dashboard |

**Admin API endpoint:**
```
GET  /api/admin/error-logs               → Paginated error log list
GET  /api/admin/error-logs/:id           → Single error detail
PATCH /api/admin/error-logs/:id/resolve  → Mark as resolved
GET  /api/admin/error-master             → All error codes reference list
```

---

> Audit logs answer: **who did what, to which resource, and when.** They are permanent and immutable.

### 17.1 What Is an Audit Log?

Audit logs are different from error logs:

| | Error Log | Audit Log |
|---|---|---|
| **Purpose** | Debug technical failures | Track business-critical actions |
| **Stored in** | Console / log platform (ephemeral) | Database `audit_logs` table (permanent) |
| **Written by** | `logger.error()` | `AuditService.log()` |
| **Deleted?** | Yes — rotated after 30 days | Never deleted |
| **Who reads it?** | Developers debugging issues | Owner, finance, compliance |

---

### 17.2 Which Actions Must Be Audit Logged

Every action in this list **must** create an audit log entry. No exceptions.

**Bookings**
- Booking created
- Booking cancelled (by customer or admin)
- Booking manually created by admin
- Booking status changed by admin

**Payments**
- Payment initiated
- Payment succeeded (with amount and gateway)
- Payment failed
- Refund issued (with amount)

**Admin Actions**
- Admin login (success and failure)
- Theater created / updated / deleted
- Add-on created / updated / deleted
- Coupon created / disabled / deleted
- Review approved / rejected
- Any site setting changed

**Customer Auth**
- OTP requested
- OTP verified (login success)
- OTP failed (wrong code entered)

---

### 17.3 Audit Log Database Table

```sql
-- audit_logs table
-- This table is INSERT-only. Never UPDATE or DELETE rows.
-- Append-only ensures the log cannot be tampered with.

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  actor_type  TEXT NOT NULL,   -- 'customer' | 'admin' | 'system'
  actor_id    TEXT,            -- customer.id | admin.id | null for system events

  -- What they did
  action      TEXT NOT NULL,   -- e.g. 'booking.created', 'theater.deleted'
  category    TEXT NOT NULL,   -- 'booking' | 'payment' | 'admin' | 'auth'

  -- What resource was affected
  resource_type TEXT,          -- 'booking' | 'theater' | 'coupon' | 'review'
  resource_id   TEXT,          -- The ID of the affected record

  -- Contextual detail — stored as JSON for flexibility
  metadata    JSONB,           -- e.g. { amount: 700, gateway: 'razorpay', previous_status: 'pending' }

  -- Request context
  ip_address  TEXT,            -- Client IP at time of action
  user_agent  TEXT,            -- Browser/device info

  -- Immutable timestamp — never updated
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common query patterns
CREATE INDEX idx_audit_actor     ON audit_logs (actor_type, actor_id);
CREATE INDEX idx_audit_resource  ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_action    ON audit_logs (action);
CREATE INDEX idx_audit_created   ON audit_logs (created_at DESC);
```

---

### 17.4 AuditService — The Only Way to Write Audit Logs

```typescript
// services/audit.service.ts
/**
 * audit.service.ts
 *
 * The single entry point for writing audit log entries.
 * All audit log writes go through this service — never write to audit_logs directly.
 *
 * Rules:
 *   - Audit logging must NEVER throw or block the main operation.
 *     If audit logging fails, the business operation still succeeds.
 *   - Failures are logged as errors via the regular logger.
 *   - Use descriptive action strings in dot-notation: 'booking.cancelled'
 */
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';

// Defines the shape of data passed to AuditService.log()
interface AuditEntry {
  actorType: 'customer' | 'admin' | 'system';
  actorId?: string;              // Omit for system-triggered events (e.g. cron jobs)
  action: string;                // Dot-notation: 'payment.refund_issued'
  category: 'booking' | 'payment' | 'admin' | 'auth';
  resourceType?: string;         // Which entity was affected
  resourceId?: string;           // ID of the affected entity
  metadata?: Record<string, unknown>; // Any extra context useful for investigation
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Writes a single audit log entry to the database.
   * Fire-and-forget — does not await, never throws.
   *
   * @param entry - The structured audit event to record
   */
  static log(entry: AuditEntry): void {
    // Run asynchronously without blocking the calling function.
    // The caller does NOT await this — audit logging is best-effort.
    prisma.auditLog
      .create({
        data: {
          actor_type:    entry.actorType,
          actor_id:      entry.actorId ?? null,
          action:        entry.action,
          category:      entry.category,
          resource_type: entry.resourceType ?? null,
          resource_id:   entry.resourceId ?? null,
          metadata:      entry.metadata ?? {},
          ip_address:    entry.ipAddress ?? null,
          user_agent:    entry.userAgent ?? null,
        },
      })
      .catch((error) => {
        // Audit log failure is serious but must not crash the app.
        // Log it as an error so the team is alerted.
        logger.error('Failed to write audit log entry', {
          event:  'audit.write_failed',
          action: entry.action,
          error:  (error as Error).message,
        });
      });
  }
}
```

---

### 17.5 Usage — How to Call AuditService in Practice

```typescript
// In bookings.service.ts — after a booking is confirmed

// Record that a booking was created. The audit trail starts here.
AuditService.log({
  actorType:    'customer',
  actorId:      customer.id,
  action:       'booking.created',
  category:     'booking',
  resourceType: 'booking',
  resourceId:   newBooking.id,
  metadata: {
    theaterId:  newBooking.theater_id,
    date:       newBooking.date,
    slotId:     newBooking.slot_id,
    totalAmount: newBooking.total_amount,
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

```typescript
// In payments.service.ts — after Razorpay webhook confirms payment

// Record the exact payment amount and gateway for financial reconciliation
AuditService.log({
  actorType:    'system',            // Webhook is a system event, not user-triggered
  action:       'payment.succeeded',
  category:     'payment',
  resourceType: 'booking',
  resourceId:   booking.id,
  metadata: {
    gateway:         'razorpay',
    razorpayOrderId: webhookPayload.order_id,
    amount:          webhookPayload.amount,  // In paise — divide by 100 for INR
    currency:        'INR',
  },
});
```

```typescript
// In admin theaters controller — after a theater is deleted

// Admin deletions must always be audited — critical for accountability
AuditService.log({
  actorType:    'admin',
  actorId:      req.admin.id,        // From admin JWT middleware
  action:       'theater.deleted',
  category:     'admin',
  resourceType: 'theater',
  resourceId:   theaterId,
  metadata: {
    theaterName: theater.name,       // Capture the name before deletion
    locationId:  theater.location_id,
    deletedBy:   req.admin.email,
  },
  ipAddress: req.ip,
});
```

---

### 17.6 Audit Log Action Reference

All `action` strings must follow `<resource>.<event>` dot-notation. Use only these approved strings:

```
Bookings:
  booking.created
  booking.confirmed
  booking.cancelled_by_customer
  booking.cancelled_by_admin
  booking.manually_created       (admin creates on behalf of customer)
  booking.status_changed

Payments:
  payment.initiated
  payment.succeeded
  payment.failed
  payment.refund_issued
  payment.refund_failed

Theaters:
  theater.created
  theater.updated
  theater.deleted
  theater.slot_disabled
  theater.blackout_date_added

Auth:
  auth.otp_requested
  auth.otp_verified
  auth.otp_failed
  auth.admin_login_success
  auth.admin_login_failed
  auth.admin_2fa_failed

Reviews:
  review.submitted
  review.approved
  review.rejected
  review.reply_added

Coupons:
  coupon.created
  coupon.applied             (on a booking)
  coupon.disabled
  coupon.deleted

Settings:
  settings.updated           (any site setting changed)
  settings.policy_text_updated
```

---

### 17.7 Audit Log Rules Summary

- **Never skip** audit logging for any action in Section 17.2 — it's a hard requirement
- **Never `await`** `AuditService.log()` — it's fire-and-forget, must not slow down the request
- **Never update or delete** rows in `audit_logs` — the table is append-only by design
- **Never include secrets** in `metadata` — no passwords, no full card numbers, no raw OTPs
- **Always capture `ip_address`** on user-initiated actions for fraud investigation
- Audit logs are **permanent** — retained indefinitely, never purged

---

## 18. File & Folder Checklist

Before creating any new file, verify:

- [ ] Is there an existing file where this code belongs instead?
- [ ] Does the file name follow the naming convention for its type?
- [ ] Does the file have a header comment?
- [ ] Are all exported functions/components documented with JSDoc?
- [ ] Are all non-obvious lines commented inline?
- [ ] Does the file stay within its layer's responsibility?
- [ ] Are there any imports that are unused?
- [ ] Are there any `any` types?
- [ ] Are there any hardcoded strings that should be in `constants.ts`?
- [ ] Is the file under 200 lines? (If not, split it)
- [ ] If this file modifies a booking, payment, theater, or auth — does it call `AuditService.log()`?
- [ ] If this file can throw an error — does it use `logger.error()` with full context?
- [ ] Does any log call contain sensitive data (OTP, password, card number)?

---

*This document is mandatory reading before writing the first line of code. All team members are expected to follow these standards without exception.*
