# Luxury Cinema UI Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic dark UI with a distinctive luxury-cinema identity — Cormorant Garamond + Outfit fonts, and a premium navbar with gold-ring logo, italic wordmark, animated underline nav links, and shimmer CTA.

**Architecture:** Three isolated changes — (1) font system swap in layout/globals/tailwind, (2) Navbar component rework, (3) two new global utility classes. All pages that already use `font-display` / `font-sans` automatically inherit the new fonts with zero per-page edits.

**Tech Stack:** Next.js 14 App Router, `next/font/google`, Tailwind CSS, Framer Motion (already installed), globals.css CSS custom properties.

---

### Task 1: Swap font imports in layout.tsx

**Files:**
- Modify: `frontend/app/layout.tsx`

**Step 1: Replace font imports**

Open `frontend/app/layout.tsx`. Replace lines 6 and 12–13:

```typescript
// REMOVE these two lines:
import { DM_Sans, Playfair_Display } from 'next/font/google';
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

// ADD these instead:
import { Cormorant_Garamond, Outfit, Dancing_Script } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-script',
  display: 'swap',
});
```

**Step 2: Update the html className**

Change line 34:
```typescript
// BEFORE:
<html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>

// AFTER:
<html lang="en" className={`${cormorant.variable} ${outfit.variable} ${dancingScript.variable}`}>
```

**Step 3: Verify the file looks correct**

The complete imports block should be:
```typescript
import { Cormorant_Garamond, Outfit, Dancing_Script } from 'next/font/google';
```
No references to `DM_Sans` or `Playfair_Display` should remain.

**Step 4: Commit**
```bash
git add frontend/app/layout.tsx
git commit -m "feat(ui): swap fonts to Cormorant Garamond + Outfit"
```

---

### Task 2: Update globals.css — font imports and CSS variables

**Files:**
- Modify: `frontend/app/globals.css`

**Step 1: Replace Google Fonts @import lines**

Lines 12–14 in globals.css currently import DM Sans, Playfair Display, Dancing Script via URL. Replace all three with:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');
```

**Step 2: Update CSS custom property font values**

Inside the `:root {}` block, find the font families section (around line 74–77) and update:

```css
/* Font families */
--font-sans:    'Outfit', system-ui, sans-serif;
--font-display: 'Cormorant Garamond', Georgia, serif;
--font-script:  'Dancing Script', cursive;
```

**Step 3: Add two new utility classes**

At the end of the `@layer components` section (after the existing `.badge` and `.skeleton` classes), add:

```css
/* ── Cinematic display text — Cormorant Garamond italic, large ── */
.text-cinematic {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.15;
}

/* ── Gold underline link — animated scaleX from center ── */
.link-gold-underline {
  position: relative;
  display: inline-block;
}
.link-gold-underline::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 1.5px;
  background: #D4A017;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s ease;
}
.link-gold-underline:hover::after,
.link-gold-underline[data-active='true']::after {
  transform: scaleX(1);
}
```

**Step 4: Commit**
```bash
git add frontend/app/globals.css
git commit -m "feat(ui): update font vars and add cinematic utility classes"
```

---

### Task 3: Update tailwind.config.ts font families

**Files:**
- Modify: `frontend/tailwind.config.ts`

**Step 1: Find the fontFamily section**

Locate the `theme.extend.fontFamily` block. It currently references `DM Sans` and `Playfair Display`. Replace it with:

```typescript
fontFamily: {
  sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
  display: ['var(--font-display)', 'Georgia', 'serif'],
  script:  ['var(--font-script)', 'cursive'],
},
```

This uses CSS variables so it automatically picks up whatever font is loaded in layout.tsx — no hardcoded font names in Tailwind.

**Step 2: Commit**
```bash
git add frontend/tailwind.config.ts
git commit -m "feat(ui): wire tailwind font families to CSS variables"
```

---

### Task 4: Rework the Navbar component

**Files:**
- Modify: `frontend/components/common/Navbar.tsx`

**Step 1: Update imports**

The current import list:
```typescript
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
```
No changes needed to imports — all dependencies already present.

**Step 2: Replace the logo block (lines ~59–65)**

Find the `{/* Logo — priority set: above the fold on every page */}` block and replace it entirely:

```tsx
{/* Brand — logo with gold ring glow + Cormorant italic wordmark */}
<Link href="/" className="flex items-center gap-3 group select-none">
  {/* Gold ring + soft glow around logo */}
  <span className="relative flex-shrink-0">
    <span
      className="absolute inset-0 rounded-full"
      style={{ boxShadow: '0 0 14px 2px rgba(212,160,23,0.30)' }}
      aria-hidden="true"
    />
    <Image
      src="/logo.png"
      alt="theMagicshow logo"
      width={40}
      height={40}
      priority
      className="relative rounded-full ring-1 ring-[#D4A017]/50 group-hover:scale-105 transition-transform duration-300"
    />
  </span>

  {/* Wordmark: italic Cormorant + thin gold rule */}
  <span className="flex flex-col leading-none">
    <span
      className="text-[#D4A017] font-bold italic tracking-wide"
      style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem' }}
    >
      theMagicshow
    </span>
    <span
      className="block h-px w-full mt-0.5"
      style={{ background: 'linear-gradient(90deg, #D4A017 60%, transparent 100%)' }}
      aria-hidden="true"
    />
  </span>
</Link>
```

**Step 3: Update the desktop nav links to use animated underline**

Find the desktop nav `<Link>` element (inside `NAV_LINKS.map`) and replace the className logic:

```tsx
<Link
  key={href}
  href={href}
  className={`link-gold-underline px-2 py-2 text-sm font-medium transition-colors duration-200 ${
    isActive
      ? 'text-[#D4A017]'
      : 'text-gray-300 hover:text-white'
  }`}
  data-active={isActive ? 'true' : undefined}
>
  {label}
</Link>
```

**Step 4: Update the Book Now CTA button with shimmer hover**

Find the desktop `Book Now` link and replace:

```tsx
<Link
  href="/book"
  className="hidden md:inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold text-black transition-all duration-300"
  style={{
    background: 'linear-gradient(90deg, #D4A017 0%, #E6B020 50%, #D4A017 100%)',
    backgroundSize: '200% auto',
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.backgroundPosition = 'right center';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.backgroundPosition = 'left center';
  }}
>
  Book Now
</Link>
```

**Step 5: Commit**
```bash
git add frontend/components/common/Navbar.tsx
git commit -m "feat(ui): luxury cinema navbar — gold ring logo, italic wordmark, animated links"
```

---

### Task 5: Update Footer brand block to match

**Files:**
- Modify: `frontend/components/common/Footer.tsx`

**Step 1: Replace the brand Link block**

Find the footer brand `<Link>` (lines ~38–43) and replace:

```tsx
<Link href="/" className="flex items-center gap-3">
  <span className="relative flex-shrink-0">
    <Image
      src="/logo.png"
      alt="theMagicshow logo"
      width={36}
      height={36}
      className="rounded-full ring-1 ring-[#D4A017]/50"
    />
  </span>
  <span className="flex flex-col leading-none">
    <span
      className="text-[#D4A017] font-bold italic"
      style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}
    >
      theMagicshow
    </span>
    <span
      className="block h-px w-full mt-0.5"
      style={{ background: 'linear-gradient(90deg, #D4A017 60%, transparent 100%)' }}
      aria-hidden="true"
    />
  </span>
</Link>
```

**Step 2: Commit**
```bash
git add frontend/components/common/Footer.tsx
git commit -m "feat(ui): match footer brand block to navbar luxury style"
```

---

### Task 6: Smoke-test and verify

**Step 1: Start the dev server**
```bash
cd frontend && npm run dev
```

**Step 2: Check these items in the browser at localhost:3000**

| Check | Expected |
|---|---|
| Navbar brand | Cormorant Garamond italic gold text |
| Logo | Circular, gold ring, soft glow |
| Gold rule | Thin gradient line under "theMagicshow" |
| Nav link hover | Gold underline slides in from center |
| Active link | Gold text + underline stays visible |
| Book Now hover | Gold shimmer sweeps right |
| Page headings (Home hero, About, etc.) | Cormorant Garamond — tall, elegant serifs |
| Body text | Outfit — clean geometric sans |
| Footer brand | Matches navbar style |

**Step 3: Check mobile (375px) in DevTools**

- Hamburger menu still works
- Brand name doesn't overflow
- Logo ring renders correctly

**Step 4: Final commit**
```bash
git add -A
git commit -m "feat(ui): luxury cinema UI — Cormorant+Outfit fonts, gold navbar"
```
