# Production Launch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make The Magic Screen (themagicscreen.com) fully production-ready with real brand name, real Bhadurpally location + 4 theaters (Blue/Gold/Red Love/Jail Dark Cell), complete ASDIQA food menu with size variants, and brand rename across all 42+ files.

**Architecture:** Extend `FoodItem` with a nullable `variants Json?` field and `BookingFoodItem` with `variant_size String?` so the same item can be ordered in multiple sizes (biryani single/full, mandi 1pcs/4pcs, waffles regular/stick/sandwich). Booking store composite key becomes `(food_item_id, variant_size)`. Brand rename is a global find-replace across frontend + backend.

**Tech Stack:** Prisma ORM (schema migration), TypeScript types, Zustand store, Next.js food page, `npx prisma migrate dev`, `npx tsx prisma/seed.ts`

---

## Task 1: Prisma Schema — food variants fields

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Step 1: Add `variants` to FoodItem and `variant_size` to BookingFoodItem**

In `schema.prisma`, find the `FoodItem` model and add `variants` after `is_available`:

```prisma
model FoodItem {
  id           String        @id @default(uuid())
  category_id  String
  category     FoodCategory  @relation(fields: [category_id], references: [id])
  name         String
  description  String?
  price        Int
  is_veg       Boolean       @default(true)
  image_url    String?
  is_available Boolean       @default(true)
  variants     Json?         // [{size: "Single", price: 129}, {size: "Full", price: 239}]
  sort_order   Int           @default(0)

  booking_food_items BookingFoodItem[]

  @@map("food_items")
}
```

Find the `BookingFoodItem` model and add `variant_size` after `food_item`:

```prisma
model BookingFoodItem {
  id           String    @id @default(uuid())
  booking_id   String
  booking      Booking   @relation(fields: [booking_id], references: [id])
  food_item_id String
  food_item    FoodItem  @relation(fields: [food_item_id], references: [id])
  variant_size String?   // e.g. "Single", "Full", "1 Pcs" — null for fixed-price items
  quantity     Int       @default(1)
  unit_price   Int

  @@map("booking_food_items")
}
```

Also update the top comment on line 1 from `theMagicshow` to `The Magic Screen`.

**Step 2: Run migration**

```bash
cd backend && npx prisma migrate dev --name add_food_variants
```

Expected output: `✓  Generated Prisma Client`

**Step 3: Verify with Prisma Studio (optional)**

```bash
cd backend && npx prisma studio
```

Check that `food_items` table has a `variants` column and `booking_food_items` has `variant_size`.

**Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat(db): add food item variants and booking variant_size fields"
```

---

## Task 2: Frontend TypeScript Types

**Files:**
- Modify: `frontend/types/addon.ts`

**Step 1: Add variant types to FoodItem and FoodOrderItem**

Replace the `FoodItem` and `FoodOrderItem` interfaces:

```typescript
/** A single size/price variant option for a food item */
export interface FoodVariant {
  size: string;   // e.g. "Single", "Full", "1 Pcs", "Regular"
  price: number;
}

/** A single item on the food menu */
export interface FoodItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  is_veg: boolean;
  image_url?: string;
  is_available: boolean;
  variants?: FoodVariant[];   // present when item has size options
  sort_order: number;
}

/** A food item selected during the booking wizard */
export interface FoodOrderItem {
  food_item_id: string;
  food_item: FoodItem;
  variant_size?: string;  // which size was selected; undefined for fixed-price items
  quantity: number;
  unit_price: number;     // actual price for the selected variant
}
```

**Step 2: Commit**

```bash
git add frontend/types/addon.ts
git commit -m "feat(types): add FoodVariant and variant_size to food order types"
```

---

## Task 3: Booking Store — composite key for variant items

**Files:**
- Modify: `frontend/store/bookingStore.ts`

**Step 1: Update `setFoodItem` to use composite key `(food_item_id, variant_size)`**

Replace the `setFoodItem` implementation (lines ~233–257):

```typescript
// ---- Step 5 -----------------------------------------------------------
setFoodItem: (item) =>
  set((state) => {
    // Composite key: same item in different sizes = separate cart entries
    const existing = state.foodItems.findIndex(
      (f) => f.food_item_id === item.food_item_id && f.variant_size === item.variant_size,
    );

    if (item.quantity === 0) {
      return {
        foodItems: state.foodItems.filter(
          (f) => !(f.food_item_id === item.food_item_id && f.variant_size === item.variant_size),
        ),
      };
    }

    if (existing !== -1) {
      const updated = [...state.foodItems];
      updated[existing] = item;
      return { foodItems: updated };
    }

    return { foodItems: [...state.foodItems, item] };
  }),
```

**Step 2: Update the sessionStorage key** (prevents stale session data from old name)

Find `name: 'themagicshow-booking'` and change to:

```typescript
name: 'themagicscreen-booking',
```

**Step 3: Commit**

```bash
git add frontend/store/bookingStore.ts
git commit -m "feat(store): composite key for variant food items, rename session key"
```

---

## Task 4: Seed Overhaul — Location & Theaters

**Files:**
- Modify: `backend/prisma/seed.ts` — replace the entire `seedLocationsTheatersSlots()` function

**Step 1: Replace `seedLocationsTheatersSlots()`**

Replace the entire function body with the code below. Key decisions:
- 1 location: Bhadurpally (update address/maps URLs once you have the real ones)
- 4 theaters: Blue ₹799, Gold ₹999, Red Love ₹1199 (couple-only), Jail Dark Cell ₹1399
- `short_slot_price` = base_price − 150 (update via admin panel after launch)
- `max_capacity` = 10 for group theaters, 2 for couple-only
- `extra_adult_price` = 150, `extra_child_price` = 100

```typescript
async function seedLocationsTheatersSlots(): Promise<void> {
  console.log("Seeding locations, theaters, and time slots …");

  // ── Location ──────────────────────────────────────────────────────────────

  const bhadurpally = await prisma.location.upsert({
    where: { slug: "bhadurpally" },
    update: {
      name: "Bhadurpally",
      address: "Bhadurpally, Hyderabad, Telangana 500055",
      google_maps_url: "https://maps.google.com/?q=Bhadurpally+Hyderabad",
      google_maps_embed_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.0!2d78.4200!3d17.4900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQmhhZHVycGFsbHk!5e0!3m2!1sen!2sin!4v1700000000000",
      latitude: 17.49,
      longitude: 78.42,
      google_rating: 4.5,
      google_review_count: 0,
      is_active: true,
    },
    create: {
      name: "Bhadurpally",
      slug: "bhadurpally",
      address: "Bhadurpally, Hyderabad, Telangana 500055",
      google_maps_url: "https://maps.google.com/?q=Bhadurpally+Hyderabad",
      google_maps_embed_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.0!2d78.4200!3d17.4900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQmhhZHVycGFsbHk!5e0!3m2!1sen!2sin!4v1700000000000",
      latitude: 17.49,
      longitude: 78.42,
      google_rating: 4.5,
      google_review_count: 0,
      is_active: true,
    },
  });

  // Mark old locations inactive (in case re-seeding over existing DB)
  await prisma.location.updateMany({
    where: { slug: { in: ["hitec-city", "miyapur"] } },
    data: { is_active: false },
  });

  console.log(`  ✓ Location: Bhadurpally (${bhadurpally.id})`);

  // ── Theater definitions ───────────────────────────────────────────────────

  type TheaterSeed = {
    location_id: string;
    name: string;
    slug: string;
    screen_size: string;
    screen_resolution: string;
    sound_system: string;
    max_capacity: number;
    base_capacity: number;
    base_price: number;
    short_slot_price: number;
    extra_adult_price: number;
    extra_child_price: number;
    allow_extra_persons: boolean;
    couple_only: boolean;
    description: string;
    images: object;
    sort_order: number;
  };

  const theaterDefs: TheaterSeed[] = [
    {
      location_id: bhadurpally.id,
      name: "Blue",
      slug: "bhadurpally-blue",
      screen_size: '120"',
      screen_resolution: "4K",
      sound_system: "Dolby Digital 5.1",
      max_capacity: 10,
      base_capacity: 4,
      base_price: 799,
      short_slot_price: 649,
      extra_adult_price: 150,
      extra_child_price: 100,
      allow_extra_persons: true,
      couple_only: false,
      description:
        "The Blue theater is a cozy private cinema with a vibrant blue-themed ambiance, perfect for small groups and intimate celebrations.",
      images: { banner: "", gallery: [] },
      sort_order: 1,
    },
    {
      location_id: bhadurpally.id,
      name: "Gold",
      slug: "bhadurpally-gold",
      screen_size: '133"',
      screen_resolution: "4K",
      sound_system: "Dolby Digital 5.1",
      max_capacity: 10,
      base_capacity: 4,
      base_price: 999,
      short_slot_price: 849,
      extra_adult_price: 150,
      extra_child_price: 100,
      allow_extra_persons: true,
      couple_only: false,
      description:
        "The Gold theater offers a premium gold-themed private screening experience with an enhanced 133-inch display — our most popular choice.",
      images: { banner: "", gallery: [] },
      sort_order: 2,
    },
    {
      location_id: bhadurpally.id,
      name: "Red Love",
      slug: "bhadurpally-red-love",
      screen_size: '120"',
      screen_resolution: "4K",
      sound_system: "Dolby Digital 5.1",
      max_capacity: 2,
      base_capacity: 2,
      base_price: 1199,
      short_slot_price: 999,
      extra_adult_price: 0,
      extra_child_price: 0,
      allow_extra_persons: false,
      couple_only: true,
      description:
        "Red Love is our exclusive couples-only theater — a deeply romantic red-hued private screen designed for the perfect anniversary, proposal, or date night.",
      images: { banner: "", gallery: [] },
      sort_order: 3,
    },
    {
      location_id: bhadurpally.id,
      name: "Jail Dark Cell",
      slug: "bhadurpally-jail-dark-cell",
      screen_size: '133"',
      screen_resolution: "4K",
      sound_system: "Dolby Atmos 7.1",
      max_capacity: 10,
      base_capacity: 4,
      base_price: 1399,
      short_slot_price: 1199,
      extra_adult_price: 150,
      extra_child_price: 100,
      allow_extra_persons: true,
      couple_only: false,
      description:
        "Jail Dark Cell is our most immersive premium theater — a dramatic, moody dark-themed private cinema experience with Dolby Atmos 7.1 surround sound.",
      images: { banner: "", gallery: [] },
      sort_order: 4,
    },
  ];

  // Mark old theaters inactive
  await prisma.theater.updateMany({
    where: {
      slug: {
        in: [
          "hitec-city-platinum", "hitec-city-majestic",
          "hitec-city-stellar", "hitec-city-scarlet",
          "miyapur-nova", "miyapur-eclipse",
          "miyapur-prism", "miyapur-aura",
        ],
      },
    },
    data: { is_active: false },
  });

  // ── Time slot template (4 slots per theater) ───────────────────────────────

  const slotTemplate = [
    { slot_name: "Morning",   start_time: "09:00", end_time: "12:00" },
    { slot_name: "Afternoon", start_time: "12:00", end_time: "17:00" },
    { slot_name: "Evening",   start_time: "17:00", end_time: "21:00" },
    { slot_name: "Night",     start_time: "21:00", end_time: "01:00" },
  ];

  for (const def of theaterDefs) {
    const theater = await prisma.theater.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        screen_size: def.screen_size,
        screen_resolution: def.screen_resolution,
        sound_system: def.sound_system,
        max_capacity: def.max_capacity,
        base_capacity: def.base_capacity,
        base_price: def.base_price,
        short_slot_price: def.short_slot_price,
        extra_adult_price: def.extra_adult_price,
        extra_child_price: def.extra_child_price,
        allow_extra_persons: def.allow_extra_persons,
        couple_only: def.couple_only,
        description: def.description,
        images: def.images,
        sort_order: def.sort_order,
        is_active: true,
      },
      create: {
        location_id: def.location_id,
        name: def.name,
        slug: def.slug,
        screen_size: def.screen_size,
        screen_resolution: def.screen_resolution,
        sound_system: def.sound_system,
        max_capacity: def.max_capacity,
        base_capacity: def.base_capacity,
        base_price: def.base_price,
        short_slot_price: def.short_slot_price,
        extra_adult_price: def.extra_adult_price,
        extra_child_price: def.extra_child_price,
        allow_extra_persons: def.allow_extra_persons,
        couple_only: def.couple_only,
        description: def.description,
        images: def.images,
        sort_order: def.sort_order,
        is_active: true,
      },
    });

    for (const slot of slotTemplate) {
      const existing = await prisma.timeSlot.findFirst({
        where: { theater_id: theater.id, slot_name: slot.slot_name },
      });
      if (!existing) {
        await prisma.timeSlot.create({
          data: {
            theater_id: theater.id,
            slot_name: slot.slot_name,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: true,
          },
        });
      }
    }

    console.log(`  ✓ Theater "${def.name}" (${def.slug}) + 4 slots`);
  }
}
```

**Step 2: Commit**

```bash
git add backend/prisma/seed.ts
git commit -m "feat(seed): Bhadurpally location + Blue/Gold/Red Love/Jail Dark Cell theaters"
```

---

## Task 5: Seed Overhaul — Full ASDIQA Food Menu

**Files:**
- Modify: `backend/prisma/seed.ts` — replace `seedFoodCategoriesAndItems()` entirely

**Step 1: Update the `FoodItemSeed` type to include `variants`**

At the top of `seedFoodCategoriesAndItems()`, replace the type definitions:

```typescript
type FoodVariantSeed = { size: string; price: number };

type FoodItemSeed = {
  name: string;
  price: number;       // base price (also shown for fixed-price items)
  is_veg: boolean;
  variants?: FoodVariantSeed[];  // omit for fixed-price items
};

type FoodCategorySeed = {
  name: string;
  sort_order: number;
  items: FoodItemSeed[];
};
```

**Step 2: Replace the `categories` array with the full ASDIQA menu**

```typescript
const categories: FoodCategorySeed[] = [

  // ── 1. Salads ──────────────────────────────────────────────────────────────
  {
    name: "Salads", sort_order: 1,
    items: [
      { name: "Veg Salad",       price: 60, is_veg: true },
      { name: "Cucumber Salad",  price: 60, is_veg: true },
      { name: "Green Salad",     price: 70, is_veg: true },
    ],
  },

  // ── 2. Veg Soups ───────────────────────────────────────────────────────────
  {
    name: "Veg Soups", sort_order: 2,
    items: [
      { name: "Veg Hot and Sour Soup",   price: 99, is_veg: true },
      { name: "Veg Manchow Soup",        price: 99, is_veg: true },
      { name: "Lemon Coriander Soup",    price: 99, is_veg: true },
      { name: "Tomato Soup",             price: 99, is_veg: true },
      { name: "Sweet Corn Soup",         price: 99, is_veg: true },
    ],
  },

  // ── 3. Non-Veg Soups ───────────────────────────────────────────────────────
  {
    name: "Non-Veg Soups", sort_order: 3,
    items: [
      { name: "Chicken Hot and Sour Soup", price: 109, is_veg: false },
      { name: "Chicken Manchow Soup",      price: 109, is_veg: false },
      { name: "Spl-Chicken Soup",          price: 109, is_veg: false },
    ],
  },

  // ── 4. Starters Veg ────────────────────────────────────────────────────────
  {
    name: "Starters Veg", sort_order: 4,
    items: [
      { name: "Paneer Manchurain",     price: 99,  is_veg: true },
      { name: "Paneer 65",             price: 109, is_veg: true },
      { name: "Paneer Majestic",       price: 109, is_veg: true },
      { name: "Chilli Paneer",         price: 119, is_veg: true },
      { name: "Paneer Tikka",          price: 119, is_veg: true },
      { name: "Pudhina Paneer Tikka",  price: 109, is_veg: true },
      { name: "Malai Paneer Tikka",    price: 119, is_veg: true },
      { name: "Paneer Pakoda",         price: 109, is_veg: true },
      { name: "Veg Manchurian",        price: 70,  is_veg: true },
      { name: "Veg 65",                price: 89,  is_veg: true },
      { name: "Gobi Manchurian",       price: 79,  is_veg: true },
      { name: "Gobi 65",               price: 89,  is_veg: true },
      { name: "Baby Corn Manchurian",  price: 119, is_veg: true },
      { name: "Baby Corn 65",          price: 129, is_veg: true },
      { name: "Mushroom Manchurian",   price: 119, is_veg: true },
      { name: "Mushroom 65",           price: 129, is_veg: true },
    ],
  },

  // ── 5. Non-Veg Starters ────────────────────────────────────────────────────
  {
    name: "Non-Veg Starters", sort_order: 5,
    items: [
      { name: "Chicken 555",        price: 179, is_veg: false },
      { name: "Chilli Chicken",     price: 179, is_veg: false },
      { name: "Dragon Chicken",     price: 179, is_veg: false },
      { name: "Chicken Drumstick",  price: 179, is_veg: false },
      { name: "Chicken Wings",      price: 179, is_veg: false },
      { name: "Pepper Chicken",     price: 179, is_veg: false },
      { name: "Chicken Pakoda",     price: 129, is_veg: false },
      { name: "Chicken Ghee Rost",  price: 199, is_veg: false },
      { name: "Mutton Dry",         price: 299, is_veg: false },
      { name: "Chicken Manchurian", price: 99,  is_veg: false },
      { name: "Lemon Chicken",      price: 179, is_veg: false },
      { name: "Cripsy Chicken",     price: 179, is_veg: false },
      { name: "Chicken 65",         price: 179, is_veg: false },
      { name: "Chicken Majestic",   price: 179, is_veg: false },
      { name: "Chicken Lollipop",   price: 179, is_veg: false },
      { name: "Egg Chilli",         price: 109, is_veg: false },
      { name: "Egg Manchurian",     price: 99,  is_veg: false },
    ],
  },

  // ── 6. Sea Food Starters ───────────────────────────────────────────────────
  {
    name: "Sea Food Starters", sort_order: 6,
    items: [
      { name: "Appollo Fish",   price: 249, is_veg: false },
      { name: "Tiger Prawns",   price: 249, is_veg: false },
      { name: "Pepper Fish",    price: 249, is_veg: false },
      { name: "Pepper Prawns",  price: 249, is_veg: false },
      { name: "Chilli Prawns",  price: 249, is_veg: false },
      { name: "Chilli Fish",    price: 249, is_veg: false },
    ],
  },

  // ── 7. Veg Curries ─────────────────────────────────────────────────────────
  {
    name: "Veg Curries", sort_order: 7,
    items: [
      { name: "Dal Tadka",             price: 69,  is_veg: true },
      { name: "Dal Fry",               price: 59,  is_veg: true },
      { name: "Gobi Masala",           price: 89,  is_veg: true },
      { name: "Mushroom Curry",        price: 159, is_veg: true },
      { name: "Mix Veg Curry",         price: 89,  is_veg: true },
      { name: "Paneer Curry",          price: 139, is_veg: true },
      { name: "Paneer Butter Masala",  price: 159, is_veg: true },
      { name: "Paneer Tikka Masala",   price: 159, is_veg: true },
      { name: "Kaju Paneer",           price: 179, is_veg: true },
      { name: "Kadai Paneer",          price: 149, is_veg: true },
      { name: "Sahi Paneer",           price: 179, is_veg: true },
      { name: "Palak Paneer",          price: 159, is_veg: true },
    ],
  },

  // ── 8. Non-Veg Curries ─────────────────────────────────────────────────────
  {
    name: "Non-Veg Curries", sort_order: 8,
    items: [
      { name: "Chicken Curry",           price: 109, is_veg: false },
      { name: "Chicken Fry",             price: 129, is_veg: false },
      { name: "Chicken Masala",          price: 139, is_veg: false },
      { name: "Chicken Butter Masala",   price: 189, is_veg: false },
      { name: "Chicken Tikka Masala",    price: 189, is_veg: false },
      { name: "Methi Chicken",           price: 189, is_veg: false },
      { name: "Kadai Chicken",           price: 189, is_veg: false },
      { name: "Dumka Chicken",           price: 189, is_veg: false },
      { name: "Panjabi Chiken",          price: 189, is_veg: false },
      { name: "Telangana Chicken",       price: 189, is_veg: false },
      { name: "Kaju Chicken",            price: 189, is_veg: false },
      { name: "Andhra Chicken Curry",    price: 189, is_veg: false },
      { name: "Afgani Chicken Curry",    price: 189, is_veg: false },
      { name: "Moglai Chicken Curry",    price: 189, is_veg: false },
      { name: "Ginger Chicken",          price: 189, is_veg: false },
      { name: "Chilli Chicken Curry",    price: 169, is_veg: false },
      { name: "Chicken Sahi Khorma",     price: 189, is_veg: false },
      { name: "Tandoori Chicken Masala", price: 199, is_veg: false },
      { name: "Hyderabadi Chicken",      price: 189, is_veg: false },
      { name: "Egg Masala",              price: 79,  is_veg: false },
      { name: "Egg Curry",               price: 79,  is_veg: false },
      { name: "Egg Burji",               price: 79,  is_veg: false },
      { name: "Egg Kheema Masala",       price: 79,  is_veg: false },
    ],
  },

  // ── 9. Mutton Curries ──────────────────────────────────────────────────────
  {
    name: "Mutton Curries", sort_order: 9,
    items: [
      { name: "Mutton Curry",     price: 239, is_veg: false },
      { name: "Mutton Masala",    price: 239, is_veg: false },
      { name: "Mutton Fry",       price: 279, is_veg: false },
      { name: "Mutton Ghee Rost", price: 279, is_veg: false },
      { name: "Mutton Kadai",     price: 279, is_veg: false },
    ],
  },

  // ── 10. Fish & Prawns Curries ──────────────────────────────────────────────
  {
    name: "Fish & Prawns", sort_order: 10,
    items: [
      { name: "Fish Curry",    price: 259, is_veg: false },
      { name: "Fish Fry",      price: 265, is_veg: false },
      { name: "Fish Masala",   price: 265, is_veg: false },
      { name: "Prawns Curry",  price: 265, is_veg: false },
      { name: "Prawns Masala", price: 279, is_veg: false },
      { name: "Prawns Fry",    price: 279, is_veg: false },
    ],
  },

  // ── 11. Tandoori ───────────────────────────────────────────────────────────
  {
    name: "Tandoori", sort_order: 11,
    items: [
      {
        name: "Tandoori Chicken", price: 199, is_veg: false,
        variants: [{ size: "Half", price: 199 }, { size: "Full", price: 379 }],
      },
      {
        name: "Tangidi Kabab", price: 179, is_veg: false,
        variants: [{ size: "3 Pcs", price: 179 }, { size: "6 Pcs", price: 340 }],
      },
      { name: "Chicken Tikka",   price: 189, is_veg: false },
      { name: "Malai Kabab",     price: 199, is_veg: false },
      { name: "Resmi Kabab",     price: 189, is_veg: false },
      { name: "Hariyali Kabab",  price: 189, is_veg: false },
      { name: "Angara Kabab",    price: 199, is_veg: false },
      { name: "Paneer Tikka",    price: 199, is_veg: true  },
    ],
  },

  // ── 12. Rotis ──────────────────────────────────────────────────────────────
  {
    name: "Rotis", sort_order: 12,
    items: [
      { name: "Rumali Roti",    price: 20, is_veg: true },
      { name: "Tandoori Roti",  price: 15, is_veg: true },
      { name: "Butter Roti",    price: 20, is_veg: true },
      { name: "Plain Naan",     price: 25, is_veg: true },
      { name: "Butter Naan",    price: 30, is_veg: true },
      { name: "Garlic Naan",    price: 35, is_veg: true },
      { name: "Plain Kulcha",   price: 20, is_veg: true },
      { name: "Masala Kulcha",  price: 30, is_veg: true },
      { name: "Tandoori Parata", price: 20, is_veg: true },
      { name: "Butter Parota",  price: 25, is_veg: true },
      { name: "Lacha Parota",   price: 30, is_veg: true },
    ],
  },

  // ── 13. Rice Items ─────────────────────────────────────────────────────────
  {
    name: "Rice Items", sort_order: 13,
    items: [
      { name: "Jeera Rice",                  price: 69,  is_veg: true  },
      { name: "Veg Fried Rice",              price: 79,  is_veg: true  },
      { name: "Egg Fried Rice",              price: 79,  is_veg: false },
      { name: "Chicken Fried Rice",          price: 109, is_veg: false },
      { name: "Mixed Fried Rice",            price: 99,  is_veg: false },
      { name: "Schezwan Chicken Fried Rice", price: 119, is_veg: false },
      { name: "Schezwan Egg Fried Rice",     price: 99,  is_veg: false },
      { name: "Schezwan Veg Fried Rice",     price: 89,  is_veg: true  },
      { name: "Curd Rice",                   price: 79,  is_veg: true  },
    ],
  },

  // ── 14. Pulavs ─────────────────────────────────────────────────────────────
  {
    name: "Pulavs", sort_order: 14,
    items: [
      {
        name: "Veg Pulav", price: 129, is_veg: true,
        variants: [{ size: "Single", price: 129 }, { size: "Full", price: 239 }],
      },
      {
        name: "Gutti Vankaya Pulav", price: 139, is_veg: true,
        variants: [{ size: "Single", price: 139 }, { size: "Full", price: 259 }],
      },
      {
        name: "Mushroom Pulav", price: 199, is_veg: true,
        variants: [{ size: "Single", price: 199 }, { size: "Full", price: 379 }],
      },
      {
        name: "Paneer Pulav", price: 169, is_veg: true,
        variants: [{ size: "Single", price: 169 }, { size: "Full", price: 319 }],
      },
      {
        name: "Paneer Fry Pic Pulav", price: 179, is_veg: true,
        variants: [{ size: "Single", price: 179 }, { size: "Full", price: 339 }],
      },
      {
        name: "Egg Pulav", price: 149, is_veg: false,
        variants: [{ size: "Single", price: 149 }, { size: "Full", price: 279 }],
      },
      {
        name: "Chicken Fry Pic Pulav", price: 199, is_veg: false,
        variants: [{ size: "Single", price: 199 }, { size: "Full", price: 379 }],
      },
      {
        name: "Mutton Fry Pic Pulav", price: 249, is_veg: false,
        variants: [{ size: "Single", price: 249 }, { size: "Full", price: 479 }],
      },
    ],
  },

  // ── 15. Biryanis ───────────────────────────────────────────────────────────
  {
    name: "Biryanis", sort_order: 15,
    items: [
      // Veg Biryanis
      {
        name: "Veg Biryani", price: 109, is_veg: true,
        variants: [{ size: "Single", price: 109 }, { size: "Full", price: 199 }],
      },
      {
        name: "Paneer Biryani", price: 129, is_veg: true,
        variants: [{ size: "Single", price: 129 }, { size: "Full", price: 239 }],
      },
      {
        name: "Paneer Tikka Biryani", price: 169, is_veg: true,
        variants: [{ size: "Single", price: 169 }, { size: "Full", price: 319 }],
      },
      {
        name: "Kaju Paneer Biryani", price: 179, is_veg: true,
        variants: [{ size: "Single", price: 179 }, { size: "Full", price: 339 }],
      },
      {
        name: "Kaju Biryani", price: 149, is_veg: true,
        variants: [{ size: "Single", price: 149 }, { size: "Full", price: 279 }],
      },
      {
        name: "Masoorum Biryani", price: 179, is_veg: true,
        variants: [{ size: "Single", price: 179 }, { size: "Full", price: 339 }],
      },
      // Chicken Biryanis
      {
        name: "Chicken Biryani", price: 129, is_veg: false,
        variants: [
          { size: "Mini", price: 99 }, { size: "Single", price: 129 },
          { size: "Full", price: 239 }, { size: "Handi", price: 349 },
          { size: "Family", price: 609 }, { size: "Jumbo", price: 709 },
        ],
      },
      {
        name: "Chicken Fry Biryani", price: 149, is_veg: false,
        variants: [
          { size: "Mini", price: 109 }, { size: "Single", price: 149 },
          { size: "Full", price: 269 }, { size: "Handi", price: 379 },
          { size: "Family", price: 639 }, { size: "Jumbo", price: 739 },
        ],
      },
      {
        name: "Chicken Mughlai Biryani", price: 169, is_veg: false,
        variants: [
          { size: "Mini", price: 129 }, { size: "Single", price: 169 },
          { size: "Full", price: 289 }, { size: "Handi", price: 399 },
          { size: "Family", price: 659 }, { size: "Jumbo", price: 759 },
        ],
      },
      {
        name: "Chicken Spl Biryani", price: 169, is_veg: false,
        variants: [
          { size: "Mini", price: 129 }, { size: "Single", price: 169 },
          { size: "Full", price: 289 }, { size: "Handi", price: 399 },
          { size: "Family", price: 659 }, { size: "Jumbo", price: 759 },
        ],
      },
      {
        name: "Chicken 65 Biryani", price: 179, is_veg: false,
        variants: [
          { size: "Mini", price: 139 }, { size: "Single", price: 179 },
          { size: "Full", price: 299 }, { size: "Handi", price: 409 },
          { size: "Family", price: 669 }, { size: "Jumbo", price: 769 },
        ],
      },
      {
        name: "Mutton Biryani", price: 199, is_veg: false,
        variants: [
          { size: "Mini", price: 149 }, { size: "Single", price: 199 },
          { size: "Full", price: 349 }, { size: "Handi", price: 469 },
          { size: "Family", price: 739 }, { size: "Jumbo", price: 839 },
        ],
      },
      {
        name: "Spl Mutton Biryani", price: 219, is_veg: false,
        variants: [
          { size: "Mini", price: 179 }, { size: "Single", price: 219 },
          { size: "Full", price: 369 }, { size: "Handi", price: 489 },
          { size: "Family", price: 759 }, { size: "Jumbo", price: 859 },
        ],
      },
      {
        name: "Mutton Fry Biryani", price: 219, is_veg: false,
        variants: [
          { size: "Mini", price: 179 }, { size: "Single", price: 219 },
          { size: "Full", price: 369 }, { size: "Handi", price: 489 },
          { size: "Family", price: 759 }, { size: "Jumbo", price: 859 },
        ],
      },
      // Fish/Prawn Biryanis
      {
        name: "Fish Biryani", price: 249, is_veg: false,
        variants: [{ size: "Single", price: 249 }, { size: "Full", price: 379 }],
      },
      {
        name: "Prance Biryani", price: 249, is_veg: false,
        variants: [{ size: "Single", price: 249 }, { size: "Full", price: 379 }],
      },
    ],
  },

  // ── 16. Mandi ──────────────────────────────────────────────────────────────
  {
    name: "Mandi", sort_order: 16,
    items: [
      // Chicken Main Course
      {
        name: "Chicken Fry Mandi", price: 229, is_veg: false,
        variants: [{ size: "1 Pcs", price: 229 }, { size: "2 Pcs", price: 419 }, { size: "3 Pcs", price: 529 }, { size: "4 Pcs", price: 729 }],
      },
      {
        name: "Chicken Juicy Mandi", price: 259, is_veg: false,
        variants: [{ size: "1 Pcs", price: 259 }, { size: "2 Pcs", price: 489 }, { size: "3 Pcs", price: 609 }, { size: "4 Pcs", price: 789 }],
      },
      {
        name: "Chicken Faham Mandi", price: 269, is_veg: false,
        variants: [{ size: "1 Pcs", price: 269 }, { size: "2 Pcs", price: 509 }, { size: "3 Pcs", price: 649 }, { size: "4 Pcs", price: 839 }],
      },
      {
        name: "Chicken BBQ Mandi", price: 269, is_veg: false,
        variants: [{ size: "1 Pcs", price: 269 }, { size: "2 Pcs", price: 509 }, { size: "3 Pcs", price: 649 }, { size: "4 Pcs", price: 839 }],
      },
      // Special Mandi
      {
        name: "Broasted Chicken Mandi", price: 259, is_veg: false,
        variants: [{ size: "1 Pcs", price: 259 }, { size: "2 Pcs", price: 489 }, { size: "3 Pcs", price: 739 }, { size: "4 Pcs", price: 999 }],
      },
      {
        name: "Chicken 65 Mandi", price: 259, is_veg: false,
        variants: [{ size: "1 Pcs", price: 259 }, { size: "2 Pcs", price: 489 }, { size: "3 Pcs", price: 739 }, { size: "4 Pcs", price: 999 }],
      },
      {
        name: "Chicken Lollipop Mandi", price: 259, is_veg: false,
        variants: [{ size: "1 Pcs", price: 259 }, { size: "2 Pcs", price: 489 }, { size: "3 Pcs", price: 739 }, { size: "4 Pcs", price: 999 }],
      },
      {
        name: "Chicken Wings Mandi", price: 259, is_veg: false,
        variants: [{ size: "1 Pcs", price: 259 }, { size: "2 Pcs", price: 489 }, { size: "3 Pcs", price: 739 }, { size: "4 Pcs", price: 999 }],
      },
      {
        name: "Chicken Crispy Mandi", price: 259, is_veg: false,
        variants: [{ size: "1 Pcs", price: 259 }, { size: "2 Pcs", price: 489 }, { size: "3 Pcs", price: 739 }, { size: "4 Pcs", price: 999 }],
      },
      // Mutton Main Course
      {
        name: "Mutton Fry Mandi", price: 279, is_veg: false,
        variants: [{ size: "1 Pcs", price: 279 }, { size: "2 Pcs", price: 499 }, { size: "3 Pcs", price: 709 }, { size: "4 Pcs", price: 899 }],
      },
      {
        name: "Mutton Juicy Mandi", price: 309, is_veg: false,
        variants: [{ size: "1 Pcs", price: 309 }, { size: "2 Pcs", price: 559 }, { size: "3 Pcs", price: 729 }, { size: "4 Pcs", price: 999 }],
      },
      {
        name: "Mutton Ghee Roast Mandi", price: 329, is_veg: false,
        variants: [{ size: "1 Pcs", price: 329 }, { size: "2 Pcs", price: 599 }, { size: "3 Pcs", price: 789 }, { size: "4 Pcs", price: 999 }],
      },
      // Sea Main Course
      {
        name: "Fish Fry Mandi", price: 299, is_veg: false,
        variants: [{ size: "1 Pcs", price: 299 }, { size: "2 Pcs", price: 499 }],
      },
      {
        name: "Prawns Mandi", price: 309, is_veg: false,
        variants: [{ size: "1 Pcs", price: 309 }, { size: "2 Pcs", price: 529 }],
      },
      // Veg Main Course
      {
        name: "Paneer Fry Mandi", price: 229, is_veg: true,
        variants: [{ size: "1 Pcs", price: 229 }, { size: "2 Pcs", price: 399 }],
      },
      {
        name: "Chilli Paneer Mandi", price: 249, is_veg: true,
        variants: [{ size: "1 Pcs", price: 249 }, { size: "2 Pcs", price: 429 }],
      },
    ],
  },

  // ── 17. ASDIQA Special Platters ────────────────────────────────────────────
  {
    name: "Special Platters", sort_order: 17,
    items: [
      { name: "Full Platter (Serves 5)",    price: 1559, is_veg: false },
      { name: "Chicken Masthi (Serves 5)",  price: 1259, is_veg: false },
      { name: "Mutton Masthi (Serves 5)",   price: 1799, is_veg: false },
    ],
  },

  // ── 18. Bagara Items ───────────────────────────────────────────────────────
  {
    name: "Bagara Items", sort_order: 18,
    items: [
      { name: "Bagara with Paneer Curry",              price: 109,  is_veg: true  },
      { name: "Bagara with Chicken Curry",             price: 129,  is_veg: false },
      { name: "Bagara with Chicken Fry",               price: 169,  is_veg: false },
      { name: "Bagara with Mutton Curry",              price: 169,  is_veg: false },
      { name: "3 KG Baraga Rice + 1 KG Paneer Curry",  price: 899,  is_veg: true  },
      { name: "3 KG Baraga Rice + 1 KG Chicken Curry", price: 699,  is_veg: false },
      { name: "3 KG Baraga Rice + 1 KG Chicken Fry",   price: 799,  is_veg: false },
      { name: "3 KG Baraga Rice + 1 KG Mutton Fry",    price: 1299, is_veg: false },
      { name: "3 KG Baraga Rice + 1 KG Mutton Curry",  price: 1199, is_veg: false },
    ],
  },

  // ── 19. Deserts ────────────────────────────────────────────────────────────
  {
    name: "Deserts", sort_order: 19,
    items: [
      { name: "Kaddhuka Keer",    price: 50, is_veg: true },
      { name: "Double Ka Meta",   price: 50, is_veg: true },
      { name: "Kurbhanika Meeta", price: 50, is_veg: true },
    ],
  },

  // ── 20. Shawarma ───────────────────────────────────────────────────────────
  {
    name: "Shawarma", sort_order: 20,
    items: [
      { name: "Chicken Shawarma with Salad",    price: 99,  is_veg: false },
      { name: "Chicken Shawarma without Salad", price: 109, is_veg: false },
      { name: "Bucket Shawarma",                price: 119, is_veg: false },
      { name: "Shawarma + French Fries",        price: 109, is_veg: false },
      { name: "Bring Your Own Bag Shawarma",    price: 99,  is_veg: false },
      { name: "Chicken Spl Shawarma",           price: 150, is_veg: false },
      { name: "Chicken 65 Shawarma",            price: 129, is_veg: false },
    ],
  },

  // ── 21. Burger & Sandwich ──────────────────────────────────────────────────
  {
    name: "Burger & Sandwich", sort_order: 21,
    items: [
      { name: "Veg Burger",       price: 69, is_veg: true  },
      { name: "Chicken Burger",   price: 89, is_veg: false },
      { name: "Veg Sandwich",     price: 49, is_veg: true  },
      { name: "Chicken Sandwich", price: 69, is_veg: false },
      { name: "French Fries",     price: 50, is_veg: true  },
    ],
  },

  // ── 22. Mojitos ────────────────────────────────────────────────────────────
  {
    name: "Mojitos", sort_order: 22,
    items: [
      { name: "Green Apple Mojito",    price: 55, is_veg: true },
      { name: "Mintlime Breeze Mojito",price: 55, is_veg: true },
      { name: "Strawberry Fizz Mojito",price: 55, is_veg: true },
      { name: "Blue Ocean Mojito",     price: 55, is_veg: true },
      { name: "Blueberry Mojito",      price: 55, is_veg: true },
      { name: "Kiwi Mojito",           price: 55, is_veg: true },
      { name: "Lemon Ice Mojito",      price: 55, is_veg: true },
      { name: "Watermelon Mojito",     price: 55, is_veg: true },
    ],
  },

  // ── 23. Fruit Juice ────────────────────────────────────────────────────────
  {
    name: "Fruit Juice", sort_order: 23,
    items: [
      { name: "Apple Juice",       price: 59, is_veg: true },
      { name: "Mango Juice",       price: 49, is_veg: true },
      { name: "Pineapple Juice",   price: 49, is_veg: true },
      { name: "Sapota Juice",      price: 59, is_veg: true },
      { name: "Muskmelon Juice",   price: 49, is_veg: true },
      { name: "Kiwi Juice",        price: 79, is_veg: true },
      { name: "Pomegranate Juice", price: 69, is_veg: true },
      { name: "Dragon Fruit Juice",price: 79, is_veg: true },
      { name: "Orange Juice",      price: 59, is_veg: true },
      { name: "Grapes Juice",      price: 49, is_veg: true },
      { name: "Watermelon Juice",  price: 39, is_veg: true },
      { name: "Banana Juice",      price: 39, is_veg: true },
      { name: "Mixed Fruit Juice", price: 79, is_veg: true },
      { name: "Sithaphal Juice",   price: 79, is_veg: true },
      { name: "Avocado Juice",     price: 79, is_veg: true },
    ],
  },

  // ── 24. Lassi ──────────────────────────────────────────────────────────────
  {
    name: "Lassi", sort_order: 24,
    items: [
      { name: "Lassi",            price: 30, is_veg: true },
      { name: "Rose Lassi",       price: 40, is_veg: true },
      { name: "Mango Lassi",      price: 40, is_veg: true },
      { name: "Chocolate Lassi",  price: 40, is_veg: true },
      { name: "Blue Berry Lassi", price: 40, is_veg: true },
      { name: "Spl Lassi",        price: 40, is_veg: true },
    ],
  },

  // ── 25. Faluda ─────────────────────────────────────────────────────────────
  {
    name: "Faluda", sort_order: 25,
    items: [
      { name: "Mango Faluda",   price: 79, is_veg: true },
      { name: "Rose Faluda",    price: 79, is_veg: true },
      { name: "Dryfruit Faluda",price: 79, is_veg: true },
      { name: "Faluda",         price: 59, is_veg: true },
    ],
  },

  // ── 26. Milkshakes ─────────────────────────────────────────────────────────
  {
    name: "Milkshakes", sort_order: 26,
    items: [
      { name: "Vanilla Milkshake",      price: 55, is_veg: true },
      { name: "Chocolate Milkshake",    price: 55, is_veg: true },
      { name: "Strawberry Milkshake",   price: 55, is_veg: true },
      { name: "Mango Milkshake",        price: 65, is_veg: true },
      { name: "Oreo Milkshake",         price: 65, is_veg: true },
      { name: "Butter Scotch Milkshake",price: 55, is_veg: true },
      { name: "Kitkat Milkshake",       price: 55, is_veg: true },
      { name: "Banana Milkshake",       price: 55, is_veg: true },
      { name: "Lychee Milkshake",       price: 65, is_veg: true },
    ],
  },

  // ── 27. Thickshakes ────────────────────────────────────────────────────────
  {
    name: "Thickshakes", sort_order: 27,
    items: [
      { name: "Vanilla Thickshake",      price: 55, is_veg: true },
      { name: "Chocolate Thickshake",    price: 55, is_veg: true },
      { name: "Strawberry Thickshake",   price: 55, is_veg: true },
      { name: "Mango Thickshake",        price: 65, is_veg: true },
      { name: "Oreo Thickshake",         price: 65, is_veg: true },
      { name: "Butter Scotch Thickshake",price: 55, is_veg: true },
      { name: "Kitkat Thickshake",       price: 65, is_veg: true },
      { name: "Banana Thickshake",       price: 65, is_veg: true },
      { name: "Lychee Thickshake",       price: 65, is_veg: true },
    ],
  },

  // ── 28. Sharjah ────────────────────────────────────────────────────────────
  {
    name: "Sharjah", sort_order: 28,
    items: [
      { name: "Sharjah",      price: 50, is_veg: true },
      { name: "Spl Sharjah",  price: 60, is_veg: true },
      { name: "Oreo Sharjah", price: 70, is_veg: true },
      { name: "Kitkat Sharjah",price: 70, is_veg: true },
    ],
  },

  // ── 29. Ice Creams ─────────────────────────────────────────────────────────
  {
    name: "Ice Creams", sort_order: 29,
    items: [
      { name: "Chocolate Ice Cream",   price: 59, is_veg: true },
      { name: "Mango Ice Cream",       price: 49, is_veg: true },
      { name: "Vanilla Ice Cream",     price: 49, is_veg: true },
      { name: "Strawberry Ice Cream",  price: 59, is_veg: true },
      { name: "Butterscotch Ice Cream",price: 49, is_veg: true },
      { name: "Black Current Ice Cream",price: 79,is_veg: true },
    ],
  },

  // ── 30. Waffles ────────────────────────────────────────────────────────────
  // Each waffle flavor has 3 types: Regular / Stick / Sandwich
  {
    name: "Waffles", sort_order: 30,
    items: [
      {
        name: "Choco Waffle", price: 49, is_veg: true,
        variants: [{ size: "Regular", price: 49 }, { size: "Stick", price: 79 }, { size: "Sandwich", price: 89 }],
      },
      {
        name: "Dark Choco Waffle", price: 49, is_veg: true,
        variants: [{ size: "Regular", price: 49 }, { size: "Stick", price: 89 }, { size: "Sandwich", price: 99 }],
      },
      {
        name: "Nutella Waffle", price: 59, is_veg: true,
        variants: [{ size: "Regular", price: 59 }, { size: "Stick", price: 89 }, { size: "Sandwich", price: 99 }],
      },
      {
        name: "Triple Choco Waffle", price: 59, is_veg: true,
        variants: [{ size: "Regular", price: 59 }, { size: "Stick", price: 99 }, { size: "Sandwich", price: 99 }],
      },
      {
        name: "Oreo Waffle", price: 49, is_veg: true,
        variants: [{ size: "Regular", price: 49 }, { size: "Stick", price: 99 }, { size: "Sandwich", price: 99 }],
      },
      {
        name: "Kitkat Waffle", price: 59, is_veg: true,
        variants: [{ size: "Regular", price: 59 }, { size: "Stick", price: 99 }, { size: "Sandwich", price: 99 }],
      },
      {
        name: "Belgium Choco Waffle", price: 59, is_veg: true,
        variants: [{ size: "Regular", price: 59 }, { size: "Stick", price: 99 }, { size: "Sandwich", price: 99 }],
      },
    ],
  },

];
```

**Step 3: Update the upsert loop to handle `variants`**

Replace the upsert loop (the one with `for (const category of categories)`) with:

```typescript
  for (const cat of categories) {
    const category = await prisma.foodCategory.upsert({
      where: { name: cat.name },        // assumes name is unique enough
      update: { sort_order: cat.sort_order, is_active: true },
      create: { name: cat.name, sort_order: cat.sort_order, is_active: true },
    });

    for (let i = 0; i < cat.items.length; i++) {
      const item = cat.items[i]!;
      const existing = await prisma.foodItem.findFirst({
        where: { category_id: category.id, name: item.name },
      });
      if (!existing) {
        await prisma.foodItem.create({
          data: {
            category_id: category.id,
            name: item.name,
            price: item.price,
            is_veg: item.is_veg,
            variants: item.variants ?? null,
            is_available: true,
            sort_order: i + 1,
          },
        });
      } else {
        // Keep prices/variants up-to-date on re-seed
        await prisma.foodItem.update({
          where: { id: existing.id },
          data: { price: item.price, variants: item.variants ?? null, is_available: true },
        });
      }
    }

    console.log(`  ✓ Category "${cat.name}" — ${cat.items.length} items`);
  }
```

Note: also add `name` as `@unique` to the `FoodCategory` model in schema.prisma (`name String @unique`) so the upsert works. Then run `npx prisma migrate dev --name food_category_unique_name`.

**Step 4: Commit**

```bash
git add backend/prisma/seed.ts backend/prisma/schema.prisma
git commit -m "feat(seed): full ASDIQA food menu — 30 categories, 200+ items with variants"
```

---

## Task 6: Run the Full Seed

**Step 1: Run migration for FoodCategory unique name**

```bash
cd backend && npx prisma migrate dev --name food_category_unique_name
```

**Step 2: Run seed**

```bash
cd backend && npx tsx prisma/seed.ts
```

Expected: 35 error codes, 1 location, 4 theaters (+ 16 time slots), addons, cakes, 30 food categories.

**Step 3: Verify in Prisma Studio**

```bash
cd backend && npx prisma studio
```

Check:
- `locations`: 1 active row (Bhadurpally), old rows inactive
- `theaters`: 4 active rows (Blue, Gold, Red Love, Jail Dark Cell)
- `food_categories`: 30 rows
- `food_items`: ~200+ rows, spot-check `Chicken Biryani` has `variants` JSON with 6 sizes

**Step 4: Commit if changes to migration files**

```bash
git add backend/prisma/migrations
git commit -m "chore: run food seed migrations"
```

---

## Task 7: Food Page UI — Size Variant Selector

**Files:**
- Modify: `frontend/app/(booking)/theater/[id]/food/page.tsx`

**Step 1: Add state for expanded variant items and update helper functions**

Replace the state/helper block (lines ~24–47) with:

```typescript
const [categories, setCategories] = useState<FoodCategory[]>([]);
const [loading, setLoading] = useState(true);
// Tracks which item is showing its size picker: key = item.id
const [expandedItem, setExpandedItem] = useState<string | null>(null);

useEffect(() => {
  apiClient
    .get<{ data: FoodCategory[] }>('/food/categories')
    .then((res) => setCategories(res.data.data ?? []))
    .catch(() => { /* food is optional */ })
    .finally(() => setLoading(false));
}, []);

/** Get quantity for a specific item + variant combination */
const getQty = (itemId: string, variantSize?: string): number =>
  store.foodItems.find(
    (f) => f.food_item_id === itemId && f.variant_size === variantSize,
  )?.quantity ?? 0;

/** Resolve price for the given variant (or base price if no variant) */
const resolvePrice = (item: FoodItem, variantSize?: string): number => {
  if (variantSize && item.variants) {
    return item.variants.find((v) => v.size === variantSize)?.price ?? item.price;
  }
  return item.price;
};

const updateQty = (item: FoodItem, qty: number, variantSize?: string) => {
  store.setFoodItem({
    food_item_id: item.id,
    food_item: item,
    variant_size: variantSize,
    quantity: qty,
    unit_price: resolvePrice(item, variantSize),
  });
};
```

**Step 2: Replace the food item row render with variant-aware UI**

Replace the `cat.food_items.map((item) => { ... })` block with:

```tsx
{cat.food_items.map((item) => {
  const hasVariants = item.variants && item.variants.length > 0;
  const isExpanded = expandedItem === item.id;

  return (
    <div key={item.id} className="rounded-xl border border-white/10 bg-[#1A1A1A] overflow-hidden">
      {/* Item row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${item.is_veg ? 'border-green-500' : 'border-red-500'}`} />
            <p className="font-medium text-white text-sm truncate">{item.name}</p>
          </div>
          <p className="text-xs text-[#888] mt-0.5 ml-5">
            {hasVariants
              ? `from ${formatCurrency(item.variants![0]!.price)}`
              : formatCurrency(item.price)}
          </p>
        </div>

        {/* Fixed-price items: standard +/- */}
        {!hasVariants && (
          <div className="flex items-center gap-2 ml-4">
            {getQty(item.id) > 0 ? (
              <>
                <button type="button" onClick={() => updateQty(item, getQty(item.id) - 1)}
                  className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors">
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-white">{getQty(item.id)}</span>
                <button type="button" onClick={() => updateQty(item, getQty(item.id) + 1)}
                  className="w-7 h-7 rounded-lg border border-[#D4A017]/50 bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017] hover:bg-[#D4A017]/20 transition-colors">
                  <Plus size={12} />
                </button>
              </>
            ) : (
              <button type="button" onClick={() => updateQty(item, 1)}
                className="px-3 py-1.5 rounded-lg border border-[#D4A017]/50 text-[#D4A017] text-xs font-medium hover:bg-[#D4A017]/10 transition-colors">
                Add
              </button>
            )}
          </div>
        )}

        {/* Variant items: expand toggle */}
        {hasVariants && (
          <button type="button"
            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
            className="ml-4 px-3 py-1.5 rounded-lg border border-[#D4A017]/50 text-[#D4A017] text-xs font-medium hover:bg-[#D4A017]/10 transition-colors">
            {isExpanded ? 'Close' : 'Select Size'}
          </button>
        )}
      </div>

      {/* Variant size rows — shown when expanded */}
      {hasVariants && isExpanded && (
        <div className="border-t border-white/10 divide-y divide-white/5">
          {item.variants!.map((v) => {
            const qty = getQty(item.id, v.size);
            return (
              <div key={v.size} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <span className="text-sm text-white">{v.size}</span>
                  <span className="text-xs text-[#888] ml-2">{formatCurrency(v.price)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {qty > 0 ? (
                    <>
                      <button type="button" onClick={() => updateQty(item, qty - 1, v.size)}
                        className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-white">{qty}</span>
                      <button type="button" onClick={() => updateQty(item, qty + 1, v.size)}
                        className="w-7 h-7 rounded-lg border border-[#D4A017]/50 bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017] hover:bg-[#D4A017]/20 transition-colors">
                        <Plus size={12} />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => updateQty(item, 1, v.size)}
                      className="px-3 py-1.5 rounded-lg border border-[#D4A017]/50 text-[#D4A017] text-xs font-medium hover:bg-[#D4A017]/10 transition-colors">
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
})}
```

**Step 3: Verify the food page renders correctly**

Run `npm run dev` in the frontend, navigate to a theater's food step, confirm:
- Fixed-price items show Add/+/- buttons directly
- Variant items show "Select Size" button → expands to show size rows
- Adding items accumulates in the cart and shows in the summary step

**Step 4: Commit**

```bash
git add frontend/app/'(booking)'/theater/'[id]'/food/page.tsx
git commit -m "feat(ui): food step variant size selector for biryani/mandi/waffles etc."
```

---

## Task 8: Brand Rename — The Magic Screen

**Context:** 34 frontend files and 8 backend files contain `theMagicshow` or `themagicshow`. Domain is `https://themagicscreen.com/`.

**Step 1: Batch rename in backend files**

For each file below, replace every occurrence of `theMagicshow` with `The Magic Screen` and `themagicshow` with `themagicscreen`:

- `backend/prisma/schema.prisma` — comment on line 1
- `backend/prisma/seed.ts` — comment on line 1
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/swagger.ts`
- `backend/src/services/whatsapp.service.ts`
- `backend/package.json` — `"name"` field
- `backend/.env.example` — any app name refs

**Step 2: Update frontend constants**

In `frontend/lib/constants.ts`, update the WhatsApp support link:

```typescript
export const WHATSAPP_SUPPORT_LINK = 'https://wa.me/919999999999?text=Hi%20I%20need%20help%20with%20a%20The%20Magic%20Screen%20booking';
```

(Replace `919999999999` with the real WhatsApp business number when available.)

**Step 3: Batch rename in frontend files**

For every frontend file that contains `theMagicshow` / `themagicshow`:

Replace:
- `theMagicshow` → `The Magic Screen`
- `themagicshow` → `themagicscreen`
- `theMagicshow` in metadata titles → `The Magic Screen`
- Domain placeholder → `https://themagicscreen.com`
- Cloudinary namespace `themagicshow` → update to `themagicscreen` (or leave if Cloudinary account name differs — confirm separately)

Key files to double-check manually after batch replace:
- `frontend/app/layout.tsx` — root metadata title/description
- `frontend/app/(public)/page.tsx` — home page metadata
- `frontend/store/bookingStore.ts` — `name: 'themagicscreen-booking'` (done in Task 3)
- `frontend/package.json` — `"name"` field

**Step 4: Update `next.config.mjs`**

Check that `NEXT_PUBLIC_SITE_URL` or any hardcoded URLs reference `https://themagicscreen.com`.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(brand): rename theMagicshow → The Magic Screen, domain → themagicscreen.com"
```

---

## Task 9: Single-Location Simplification

**Context:** Only Bhadurpally is active. The `/theaters` page should show all theaters directly without a multi-location filter confusing users.

**Files:**
- Modify: `frontend/app/(public)/theaters/page.tsx`

**Step 1: Read the current theaters page**

Read `frontend/app/(public)/theaters/page.tsx` to understand its current structure.

**Step 2: If the page shows a location selector/filter, remove or hide it**

If the page fetches locations and shows a tab/filter:
- Remove the location tab UI
- Fetch `/theaters` directly (all active theaters from Bhadurpally will be returned)
- Remove any "Select Location" heading/subtext

If the page already just lists theaters by location heading (no tabs), simply verify the heading says "Bhadurpally" (which the seed data will populate automatically).

**Step 3: Commit**

```bash
git add frontend/app/'(public)'/theaters/page.tsx
git commit -m "feat(ui): simplify theaters page for single-location launch"
```

---

## Post-Implementation Checklist

Before pushing to production, verify:

- [ ] `npm run build` in `frontend/` passes with no TypeScript errors
- [ ] `cd backend && npx prisma generate` runs clean
- [ ] Seed runs without errors: `cd backend && npx tsx prisma/seed.ts`
- [ ] Food page shows ASDIQA items with variant selectors working
- [ ] Booking summary correctly totals variant-price items
- [ ] No "theMagicshow" text visible in any page title or body
- [ ] Admin panel shows 4 Bhadurpally theaters at correct prices
- [ ] All `.env` variables for production set: `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `WATI_API_KEY`, `WATI_PHONE_NUMBER`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL=https://api.themagicscreen.com`

---

## Notes for After Launch

- Update Bhadurpally `google_maps_url` and `google_maps_embed_url` with the exact venue pin once available
- Add theater images to Cloudinary and update `images.banner` / `images.gallery` via the admin panel
- Replace WhatsApp number `919999999999` in `constants.ts` with the actual business number
- Set `short_slot_price` for each theater via admin panel once pricing is confirmed