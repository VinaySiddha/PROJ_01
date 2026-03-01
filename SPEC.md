# Product Specification Document
## Private Theater Booking Website
**Version:** 1.0
**Date:** 2026-02-28
**Status:** Draft — Pending Business Name & Full Theater Data

> **Engineering Standards:** All development must follow [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) — covering code structure, naming conventions, commenting rules, testing, security, and performance.

---

## Table of Contents
1. [Business Overview](#1-business-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Tech Stack](#3-tech-stack)
4. [Information Architecture & Pages](#4-information-architecture--pages)
5. [Booking Flow (Step-by-Step)](#5-booking-flow-step-by-step)
6. [Theater & Pricing Data Model](#6-theater--pricing-data-model)
7. [Add-Ons System](#7-add-ons-system)
8. [Food Menu System](#8-food-menu-system)
9. [Admin Dashboard](#9-admin-dashboard)
10. [Reviews & Ratings](#10-reviews--ratings)
11. [WhatsApp Bot Integration](#11-whatsapp-bot-integration)
12. [Authentication & User Accounts](#12-authentication--user-accounts)
13. [Payment Integration](#13-payment-integration)
14. [SEO Strategy](#14-seo-strategy)
15. [Branding & Design System](#15-branding--design-system)
16. [API Design](#16-api-design)
17. [Database Schema](#17-database-schema)
18. [Deployment & Infrastructure](#18-deployment--infrastructure)
19. [Open Items & Next Steps](#19-open-items--next-steps)

---

## 1. Business Overview

### 1.1 What We're Building
A full-stack private theater booking platform for Hyderabad — similar to Binge 'n Bash but with:
- Better Google discoverability (server-side rendering)
- A powerful admin dashboard to manage everything without touching code
- Customer reviews and ratings on the site itself
- WhatsApp automation for booking confirmations, reminders, and support

### 1.2 Business Details
| Field | Value |
|---|---|
| Business Name | **TBD** *(placeholder: "theMagicshow")* |
| City | Hyderabad, Telangana |
| Branches | 2 (Branch names TBD) |
| Target Audience | Couples, families, friend groups, corporates — 18–40 age group |
| Primary Revenue | Theater slot bookings + add-ons (cakes, decor, photography) |
| Secondary Revenue | Food & beverage orders |

### 1.3 Key Differentiators vs Binge 'n Bash
| Feature | Binge 'n Bash | Our Platform |
|---|---|---|
| Rendering | Client-side React (bad SEO) | Next.js SSR (excellent SEO) |
| Admin panel | None (hardcoded data) | Full dashboard |
| Customer reviews | None | On-site reviews with rating |
| WhatsApp automation | Manual | Bot — confirmations + reminders |
| Payment options | PhonePe only | Razorpay + PhonePe |
| Contact page | Embedded only | Dedicated page + live chat |

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
- Go live within 8–12 weeks of spec approval
- Rank on Google Page 1 for "private theater Hyderabad" within 6 months
- Achieve 80%+ bookings via the website (vs WhatsApp manual)

### 2.2 KPIs
| Metric | Target |
|---|---|
| Page load time (LCP) | < 2.5 seconds |
| Google PageSpeed score | > 90 (mobile & desktop) |
| Booking conversion rate | > 15% of theater page visitors |
| Admin task time | < 5 min to add/edit a theater |

---

## 3. Tech Stack

### 3.1 Frontend
| Layer | Technology | Reason |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR for SEO, React ecosystem |
| Language | TypeScript | Type safety, fewer runtime bugs |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design |
| State Management | Zustand | Lightweight, simple booking flow state |
| Animations | Framer Motion | Smooth page transitions & micro-animations |
| Forms | React Hook Form + Zod | Validation, booking forms |
| Icons | Lucide React | Consistent, tree-shakeable |
| Fonts | Google Fonts (to be decided in branding) | |

### 3.2 Backend
| Layer | Technology | Reason |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Familiar, large ecosystem |
| Framework | **Express.js** | Lightweight REST API |
| Language | TypeScript | Shared types with frontend |
| ORM | Prisma | Type-safe DB queries, easy migrations |
| Auth | JWT + WhatsApp OTP | Passwordless login (like Binge n Bash) |
| File Storage | Cloudinary | Theater images, gallery uploads |
| WhatsApp | Twilio WhatsApp API or WATI | Bot + notifications |
| Cron Jobs | node-cron | Booking reminders 24hrs before slot |

### 3.3 Database
| Layer | Technology |
|---|---|
| Primary DB | PostgreSQL (hosted on Railway or Supabase) |
| Cache | Redis (slot availability, session cache) |

### 3.4 Payment
| Gateway | Use Case |
|---|---|
| Razorpay | Primary — UPI, cards, wallets, netbanking |
| PhonePe | Secondary / fallback |

> **Note:** Both gateways will be implemented. The user-facing checkout will default to Razorpay but show PhonePe as an option.

### 3.5 Deployment
| Layer | Platform |
|---|---|
| Frontend | Vercel (Next.js native) |
| Backend API | Railway or Render |
| Database | Supabase (PostgreSQL) |
| Redis | Upstash |
| Domain | Custom domain (TBD) |
| CDN / Images | Cloudinary |

---

## 4. Information Architecture & Pages

### 4.1 Public Pages (Customer-Facing)

```
/                          → Home
/about                     → About Us
/theaters                  → All theaters (both locations)
/theaters/[location-slug]  → Location-specific theater listing
/theater/[id]              → Individual theater detail
/theater/[id]/book         → Booking flow entry
/gallery                   → Photo gallery
/addons                    → Add-ons catalog
/food                      → Food menu
/contact                   → Contact page
/reviews                   → All customer reviews
/faq                       → FAQ page (dedicated, not buried)
/my-bookings               → Customer booking history (login required)
/my-bookings/login         → WhatsApp OTP login
/booking/[id]/summary      → Booking summary
/booking/[id]/status       → Payment status (success/failure)
/refund-policy             → Refund policy
/privacy-policy            → Privacy policy
/terms                     → Terms and conditions
```

### 4.2 Admin Pages (Protected)

```
/admin                          → Dashboard overview
/admin/bookings                 → All bookings (filter, search, export)
/admin/bookings/[id]            → Single booking detail
/admin/theaters                 → Manage theaters
/admin/theaters/new             → Add theater
/admin/theaters/[id]/edit       → Edit theater
/admin/addons                   → Manage add-ons
/admin/food                     → Manage food menu
/admin/cakes                    → Manage cakes
/admin/reviews                  → Moderate reviews
/admin/offers                   → Coupon codes & promotions
/admin/settings                 → Business settings (locations, contact, policies)
/admin/whatsapp                 → WhatsApp bot logs & templates
```

---

## 5. Booking Flow (Step-by-Step)

The booking is a linear wizard. State is preserved in Zustand (client) and persisted to DB on each step.

```
Step 0: Select Location
  → Hitec City / Miyapur (or future branches)

Step 1: Select Theater & Slot
  → Browse theaters by location
  → Pick date (calendar)
  → Pick time slot (Morning / Afternoon / Evening / Night)
  → Pick duration (2.5 hrs Standard | 1.5 hrs Short)
  → System checks real-time availability (Redis cache)

Step 2: Select Occasion
  → Birthday | Anniversary | Bride to Be | Mom to Be |
    Baby Shower | Farewell | Marriage Proposal |
    Private Date / Movie Night | Reunion | Other
  → Enter nickname/name for decoration personalization

Step 3: Select Cake (Optional)
  → Egg / Eggless toggle
  → Flavor selection with images and prices
  → "No Cake" option

Step 4: Select Add-Ons (Optional)
  → Decorations (multi-select)
  → Roses
  → Photography packages

Step 5: Food Pre-Order (Optional)
  → Browse menu items
  → Add to order

Step 6: Booking Form
  → Full name
  → Phone number (pre-filled if logged in)
  → Email (optional)
  → Coupon code / Referral code
  → Price breakdown (itemized)

Step 7: Payment
  → Advance amount: Rs 700 (Rs 200 non-refundable)
  → Razorpay / PhonePe checkout
  → On success → booking confirmation

Step 8: Confirmation
  → On-screen booking summary
  → WhatsApp message sent automatically
  → Email confirmation (if email provided)
```

### 5.1 Slot Availability Logic
- Each slot is a unique combination of: `theater_id + date + time_slot + duration`
- On slot selection, check Redis for real-time availability
- Slot locked for 10 minutes once user enters booking form (to prevent double booking)
- Lock released on payment failure or timeout

---

## 6. Theater & Pricing Data Model

### 6.1 Theater Fields (Managed via Admin Panel)
| Field | Type | Description |
|---|---|---|
| id | UUID | Unique identifier |
| name | String | e.g., "Platinum Theatre" |
| slug | String | URL-safe, e.g., "platinum-theatre" |
| location_id | FK | Which branch |
| screen_size | String | e.g., "150 inch" |
| screen_resolution | String | e.g., "4K" |
| sound_system | String | e.g., "1000W Dolby Atmos" |
| max_capacity | Int | Max people allowed |
| base_capacity | Int | Included in base price (usually 4) |
| base_price | Int | Price in INR for base_capacity (2.5hr slot) |
| short_slot_price | Int | Price for 1.5hr slot |
| extra_adult_price | Int | Per additional adult |
| extra_child_price | Int | Per child (3–12 yrs) |
| allow_extra_persons | Boolean | Some theaters are fixed capacity |
| couple_only | Boolean | e.g., Scarlet Theatre |
| description | Text | Rich text description |
| images | JSON Array | Cloudinary URLs |
| youtube_url | String | Embed URL |
| is_active | Boolean | Show/hide from booking |
| sort_order | Int | Display order |
| created_at | Timestamp | |
| updated_at | Timestamp | |

### 6.2 Locations Table
| Field | Type |
|---|---|
| id | UUID |
| name | String (e.g., "Hitec City") |
| slug | String (e.g., "hitec-city") |
| address | Text |
| google_maps_url | String |
| google_maps_embed_url | String |
| latitude | Decimal |
| longitude | Decimal |
| google_rating | Decimal |
| google_review_count | Int |
| is_active | Boolean |

### 6.3 Time Slots (Configurable)
| Slot | Default Time |
|---|---|
| Morning | 9:00 AM – 12:00 PM |
| Afternoon | 12:00 PM – 5:00 PM |
| Evening | 5:00 PM – 9:00 PM |
| Night | 9:00 PM – 1:00 AM |

> Admin can enable/disable individual slots per theater via the dashboard.

---

## 7. Add-Ons System

All add-ons are fully managed from the admin panel.

### 7.1 Add-On Categories
| Category | Items | Pricing Model |
|---|---|---|
| Decorations | Fog Effect, Photo Clippings, Cold Fire, Candle Path, Party Props, LED Numbers, HBD Letters | Fixed price per item |
| Roses | Single Rose, Bouquet | Fixed price |
| Photography | 20 / 50 / 75 / 100 pics / 1-hr unlimited | Fixed price per package |
| Cakes | Multiple flavors, egg/eggless | Fixed price per cake |

### 7.2 Add-On Data Model
| Field | Type |
|---|---|
| id | UUID |
| category | Enum (decoration, rose, photography, cake) |
| name | String |
| description | Text |
| price | Int |
| image_url | String |
| is_eggless | Boolean (cakes only) |
| is_active | Boolean |
| sort_order | Int |

---

## 8. Food Menu System

### 8.1 Menu Structure
- Categories: Snacks, Mains, Thickshakes, Mojitos, Ice Cream, Combos
- Items: Name, description, price, veg/non-veg tag, image, available for pre-order
- Combos: Bundled items at a discount (admin configurable)

### 8.2 Food Data Model
| Field | Type |
|---|---|
| id | UUID |
| category_id | FK |
| name | String |
| description | Text |
| price | Int |
| is_veg | Boolean |
| image_url | String |
| is_available | Boolean |
| sort_order | Int |

> Note: Food pre-order is optional during booking. In-theater ordering (QR code menu) is a **Phase 2** feature.

---

## 9. Admin Dashboard

### 9.1 Dashboard Home
- Today's bookings count
- Revenue (today / this week / this month)
- Upcoming bookings timeline
- Slot occupancy heatmap (by theater, by time slot)
- Quick actions: Add booking manually, View pending reviews

### 9.2 Bookings Management
- Table view: Booking ID, Customer name, Theater, Date, Slot, Amount, Status
- Filters: Date range, Location, Theater, Status (Confirmed/Cancelled/Pending)
- Search: By name or phone number
- Export: CSV export of bookings
- Manual booking: Admin can create bookings directly (for phone/walk-in bookings)
- Cancellation: Admin can cancel with refund flag

### 9.3 Theater Management
- Add/Edit/Delete theaters via form (no code editing)
- Upload theater images (drag & drop, Cloudinary integration)
- Enable/disable time slots per theater
- Set blackout dates (theater unavailable on specific dates)
- Toggle theater visibility (active/inactive)

### 9.4 Offers & Coupons
- Create coupon codes: percentage or flat discount
- Set validity period, max uses, min booking amount
- Per-theater or site-wide coupons
- Referral code tracking

### 9.5 Reviews Moderation
- View all submitted reviews
- Approve / Reject / Flag reviews
- Reply to reviews (response shown publicly)

### 9.6 WhatsApp Bot Logs
- Message history per booking
- Re-send confirmation / reminder button
- Template management

### 9.7 Settings
- Business info (name, address, contact, social links)
- Refund policy text (editable)
- T&C text (editable)
- Homepage banner image upload
- Marquee ticker text
- Maintenance mode toggle

---

## 10. Reviews & Ratings

### 10.1 How Reviews Work
1. After a completed booking, customer receives a WhatsApp message 2 hours post-slot asking for a review
2. Link goes to a simple review form (no login required — token-based)
3. Review includes: Star rating (1–5), text comment, optional photo upload
4. Admin approves before it goes live
5. Approved reviews show on: Theater detail page + dedicated `/reviews` page

### 10.2 Review Data Model
| Field | Type |
|---|---|
| id | UUID |
| booking_id | FK (ensures 1 review per booking) |
| theater_id | FK |
| customer_name | String |
| rating | Int (1–5) |
| comment | Text |
| photo_url | String (optional) |
| is_approved | Boolean |
| admin_reply | Text (optional) |
| created_at | Timestamp |

### 10.3 Aggregate Rating
- Each theater shows its average rating + review count
- Site-wide aggregate shown in homepage hero section

---

## 11. WhatsApp Bot Integration

### 11.1 Trigger Events & Messages

| Trigger | Message Sent |
|---|---|
| Booking confirmed | "Hi [Name]! Your booking at [Theater] on [Date] at [Slot] is confirmed. Booking ID: #[ID]. See you!" |
| 24 hours before slot | "Reminder: Your private theater experience is tomorrow at [Time]. Don't forget your OTT credentials!" |
| 2 hours after slot | "We hope you had an amazing time! Please share your experience: [Review Link]" |
| Booking cancelled | "Your booking #[ID] has been cancelled. Refund of Rs [X] will be processed in 7 working days." |
| Payment failed | "Your payment for Booking #[ID] failed. Click here to retry: [Link]" |

### 11.2 Provider
- **Primary:** WATI (WhatsApp Business API) — simpler setup for Indian businesses
- **Fallback:** Twilio WhatsApp API

### 11.3 Customer Support Chat
- WhatsApp "Chat with us" button on all pages
- Links to `wa.me/[business-number]?text=Hi%20I%20have%20a%20query`

---

## 12. Authentication & User Accounts

### 12.1 Customer Auth
- **Login method:** WhatsApp OTP (phone number → OTP via WhatsApp)
- JWT token stored in HttpOnly cookie
- Session expires in 7 days
- No password required

### 12.2 Admin Auth
- Email + password login (bcrypt hashed)
- 2FA optional (TOTP via Google Authenticator)
- Role-based access: Super Admin / Manager / Staff
  - Super Admin: Full access
  - Manager: Bookings + reviews + offers
  - Staff: View bookings only

### 12.3 My Bookings (Customer)
- View all past and upcoming bookings
- Cancel a booking (if within policy window)
- Download booking confirmation PDF
- Leave a review (if slot has passed)

---

## 13. Payment Integration

### 13.1 Payment Flow
1. Customer reaches checkout with itemized total
2. Advance amount charged: **Rs 700** (Rs 200 processing fee + Rs 500 refundable deposit)
3. Razorpay modal opens (UPI, cards, wallets, netbanking)
4. On success: booking confirmed, WhatsApp sent
5. On failure: user shown retry page, slot lock extended 5 min
6. Remaining balance (if applicable for food/add-ons) collected on-site or pre-checkout

### 13.2 Refund Logic (Automated)
| Scenario | Refund Amount | Timeline |
|---|---|---|
| Cancelled 72+ hrs before slot | Rs 500 | 7 working days |
| Cancelled < 72 hrs | Rs 0 | — |
| No-show | Rs 0 | — |
| Technical failure (theater side) | Pro-rated unused time | 7 working days |
| Payment gateway failure | Full advance | 7 working days |

### 13.3 Webhooks
- Razorpay webhook → `/api/payments/razorpay/webhook`
- PhonePe webhook → `/api/payments/phonepe/webhook`
- Signature verification on all incoming webhooks

---

## 14. SEO Strategy

### 14.1 Why Next.js for SEO
Binge 'n Bash uses a client-side React app — their pages show blank HTML to Googlebot until JS executes. Our Next.js SSR approach means Google sees **fully rendered HTML**, dramatically improving rankings.

### 14.2 On-Page SEO (Every Page)
- Unique `<title>` and `<meta description>` per page
- Open Graph + Twitter Card meta tags
- Canonical URLs
- Structured data (JSON-LD):
  - `LocalBusiness` schema on home/contact page
  - `Product` schema on theater detail pages
  - `Review` + `AggregateRating` schema on theater pages
  - `FAQPage` schema on FAQ page

### 14.3 Target Keywords
| Keyword | Page |
|---|---|
| private theater Hyderabad | Home, /theaters |
| private theater Hitec City | /theaters/hitec-city |
| private theater Miyapur | /theaters/miyapur |
| birthday party theater Hyderabad | /theater/[name] |
| couple private theater Hyderabad | /theater/[couples-theater] |
| anniversary celebration Hyderabad | /theater/[name] |

### 14.4 Technical SEO
- `sitemap.xml` auto-generated (Next.js)
- `robots.txt` configured
- Core Web Vitals optimized (LCP, CLS, FID)
- Image optimization via `next/image`
- Lazy loading for gallery images

---

## 15. Branding & Design System

> **Status: TBD** — Business name not yet finalized. Below are placeholders and guidelines for when branding is decided.

### 15.1 Brand Personality
- Premium but approachable
- Warm, celebratory, joyful
- Modern and clean

### 15.2 Color Palette (To Be Decided)
| Role | Placeholder Color | Notes |
|---|---|---|
| Primary | Deep Maroon / Navy | Luxury feel |
| Accent | Gold / Amber | Premium highlight |
| Background | Near-black (#0D0D0D) | Cinema vibe |
| Surface | Dark gray (#1A1A1A) | Card backgrounds |
| Text | White / Off-white | On dark backgrounds |
| Success | Green #22C55E | Payment success |
| Error | Red #EF4444 | Payment failure |

### 15.3 Typography (To Be Decided)
| Role | Suggestion |
|---|---|
| Headings | Playfair Display or Cormorant Garamond |
| Body | DM Sans or Inter |
| Accent/Display | Dancing Script (for celebration context) |

### 15.4 UI Component Library
- Base: shadcn/ui (built on Radix UI + Tailwind)
- Custom components: Theater card, Slot picker, Booking wizard steps, Review card

### 15.5 Design Deliverables (Before Development)
- [ ] Logo (SVG, light + dark variants)
- [ ] Color palette finalized
- [ ] Typography scale
- [ ] Figma mockups for: Home, Theater detail, Booking flow, Admin dashboard

---

## 16. API Design

### 16.1 Public API Endpoints

```
GET  /api/locations                    → All active locations
GET  /api/theaters?location=hitec-city → Theaters by location
GET  /api/theaters/:id                 → Single theater detail
GET  /api/theaters/:id/slots?date=...  → Available slots for a date
POST /api/bookings/lock-slot           → Lock a slot (10 min hold)
POST /api/bookings                     → Create booking
GET  /api/bookings/:id                 → Get booking details
POST /api/bookings/:id/cancel          → Cancel booking
GET  /api/addons                       → All add-ons
GET  /api/food                         → Food menu
GET  /api/reviews?theater=:id          → Theater reviews
POST /api/reviews                      → Submit review (token-based)
POST /api/auth/send-otp                → Send WhatsApp OTP
POST /api/auth/verify-otp              → Verify OTP, get JWT
GET  /api/my/bookings                  → Customer's bookings (auth required)
POST /api/payments/razorpay/order      → Create Razorpay order
POST /api/payments/razorpay/webhook    → Razorpay webhook
```

### 16.2 Admin API Endpoints (All require admin JWT)

```
GET    /api/admin/dashboard/stats
GET    /api/admin/bookings
POST   /api/admin/bookings             → Manual booking creation
PATCH  /api/admin/bookings/:id
GET    /api/admin/theaters
POST   /api/admin/theaters
PUT    /api/admin/theaters/:id
DELETE /api/admin/theaters/:id
GET    /api/admin/reviews
PATCH  /api/admin/reviews/:id          → Approve/reject
POST   /api/admin/coupons
GET    /api/admin/coupons
DELETE /api/admin/coupons/:id
POST   /api/admin/auth/login
```

---

## 17. Database Schema

### 17.1 Core Tables

```sql
-- locations
id, name, slug, address, maps_url, maps_embed_url, lat, lng,
google_rating, google_review_count, is_active, created_at

-- theaters
id, location_id, name, slug, screen_size, screen_resolution,
sound_system, max_capacity, base_capacity, base_price,
short_slot_price, extra_adult_price, extra_child_price,
allow_extra_persons, couple_only, description, images (jsonb),
youtube_url, is_active, sort_order, created_at, updated_at

-- time_slots (configurable per theater)
id, theater_id, slot_name, start_time, end_time, is_active

-- bookings
id, booking_ref, theater_id, customer_id, date, slot_id,
duration_type (standard|short), num_adults, num_children,
occasion, occasion_name, status (pending|confirmed|cancelled|completed),
base_amount, addons_amount, food_amount, total_amount,
advance_paid, coupon_id, referral_code, payment_id, payment_gateway,
notes, created_at, updated_at

-- booking_addons
id, booking_id, addon_id, quantity, unit_price

-- booking_food_items
id, booking_id, food_item_id, quantity, unit_price

-- customers
id, phone, name, email, created_at

-- admins
id, email, password_hash, role (super_admin|manager|staff),
is_active, last_login

-- addons
id, category, name, description, price, image_url,
is_eggless, is_active, sort_order

-- food_categories
id, name, sort_order, is_active

-- food_items
id, category_id, name, description, price, is_veg,
image_url, is_available, sort_order

-- cakes
id, name, flavor, price, is_eggless, image_url,
is_active, sort_order

-- reviews
id, booking_id, theater_id, customer_name, rating,
comment, photo_url, is_approved, admin_reply, created_at

-- coupons
id, code, type (percent|flat), value, min_amount,
max_uses, used_count, valid_from, valid_until, is_active

-- slot_locks (Redis, not DB — for real-time)
key: lock:{theater_id}:{date}:{slot_id}
value: { booking_session_id, locked_at }
TTL: 600 seconds (10 minutes)
```

---

## 18. Deployment & Infrastructure

### 18.1 Architecture

```
Browser
  ↓ HTTPS
Vercel (Next.js)
  ↓ API calls
Railway/Render (Express API)
  ↓
PostgreSQL (Supabase)     Redis (Upstash)
  ↓
Cloudinary (images)
  ↓
Razorpay / PhonePe (payments)
  ↓
WATI (WhatsApp)
```

### 18.2 Environments
| Environment | Purpose |
|---|---|
| Development | Local dev with `.env.local` |
| Staging | Preview deployments (Vercel preview URLs) |
| Production | Live site with custom domain |

### 18.3 CI/CD
- GitHub repository with main/develop branches
- Vercel auto-deploys on push to `main`
- Backend API auto-deploys on push to `main` via Railway

---

## 19. Open Items & Next Steps

### 19.1 Decisions Needed from You (Owner)
| # | Item | Priority |
|---|---|---|
| 1 | **Business name** — Choose or approve a name | HIGH |
| 2 | **Branch names** — Names for Hitec City and Miyapur branches | HIGH |
| 3 | **Theater names & pricing** — Full list for both locations | HIGH |
| 4 | **WhatsApp business number** — Number to use for bot | HIGH |
| 5 | **Domain name** — Purchase and configure | HIGH |
| 6 | **Logo & brand colors** — Design or hire designer | MEDIUM |
| 7 | **Food menu** — Full menu with prices for your business | MEDIUM |
| 8 | **Cake options** — List of available cakes | MEDIUM |
| 9 | **Add-ons list** — Confirm which add-ons you offer | MEDIUM |
| 10 | **Razorpay account** — Sign up and get API keys | HIGH |
| 11 | **WATI account** — Sign up for WhatsApp Business API | MEDIUM |
| 12 | **Cloudinary account** — For image storage | LOW |

### 19.2 Development Phases

#### Phase 1 — Core Booking Platform (Weeks 1–6)
- [ ] Project setup (Next.js + Node.js + PostgreSQL)
- [ ] All public pages (Home, About, Theaters, Gallery, Contact, FAQ)
- [ ] Complete booking flow (slot selection → payment)
- [ ] Razorpay integration
- [ ] WhatsApp OTP login
- [ ] My Bookings page
- [ ] Policy pages (Refund, Privacy, T&C)

#### Phase 2 — Admin Dashboard (Weeks 7–9)
- [ ] Admin auth
- [ ] Bookings management
- [ ] Theater CRUD
- [ ] Add-ons & food management
- [ ] Coupon management

#### Phase 3 — Reviews & WhatsApp Bot (Weeks 9–11)
- [ ] Review submission + moderation
- [ ] WhatsApp bot (confirmations, reminders, review requests)
- [ ] Admin WhatsApp log viewer

#### Phase 4 — Polish & SEO (Week 11–12)
- [ ] Structured data / JSON-LD
- [ ] Sitemap & robots.txt
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Go-live

---

*This document is a living spec. Update as decisions are made on Open Items.*
