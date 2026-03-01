// ─────────────────────────────────────────────────────────────────────────────
// theMagicshow — Prisma Seed
// Run: tsx prisma/seed.ts
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ERROR MASTER  (35 codes)
// ─────────────────────────────────────────────────────────────────────────────

async function seedErrorMaster(): Promise<void> {
  console.log("Seeding error_master …");

  const errors = [
    // ── AUTH ──────────────────────────────────────────────────────────────────
    {
      code: "AUTH_OTP_INVALID",
      http_status: 400,
      severity: "warn",
      category: "auth",
      message: "Invalid OTP",
      description: "The OTP provided does not match the one sent to the user.",
      resolution: "Ask the user to re-enter the OTP or request a new one.",
      is_retryable: true,
    },
    {
      code: "AUTH_OTP_EXPIRED",
      http_status: 400,
      severity: "warn",
      category: "auth",
      message: "OTP has expired",
      description: "The OTP has passed its validity window (default 5 minutes).",
      resolution: "Request a fresh OTP.",
      is_retryable: true,
    },
    {
      code: "AUTH_OTP_MAX_ATTEMPTS",
      http_status: 429,
      severity: "warn",
      category: "auth",
      message: "Maximum OTP attempts exceeded",
      description: "The user has exceeded the allowed number of OTP verification attempts.",
      resolution: "Wait for the lockout period to expire and request a new OTP.",
      is_retryable: false,
    },
    {
      code: "AUTH_OTP_RATE_LIMIT",
      http_status: 429,
      severity: "warn",
      category: "auth",
      message: "OTP request rate limit exceeded",
      description: "Too many OTP send requests from this phone number in a short period.",
      resolution: "Wait before requesting another OTP.",
      is_retryable: false,
    },
    {
      code: "AUTH_TOKEN_INVALID",
      http_status: 401,
      severity: "warn",
      category: "auth",
      message: "Invalid authentication token",
      description: "The JWT provided is malformed, has an invalid signature, or belongs to a different environment.",
      resolution: "Re-authenticate to obtain a valid token.",
      is_retryable: false,
    },
    {
      code: "AUTH_TOKEN_EXPIRED",
      http_status: 401,
      severity: "warn",
      category: "auth",
      message: "Authentication token has expired",
      description: "The JWT access token has passed its expiry time.",
      resolution: "Re-authenticate to obtain a fresh token.",
      is_retryable: false,
    },
    {
      code: "AUTH_UNAUTHORIZED",
      http_status: 401,
      severity: "warn",
      category: "auth",
      message: "Unauthorized",
      description: "The request is missing a valid authentication credential.",
      resolution: "Include a valid Bearer token in the Authorization header.",
      is_retryable: false,
    },
    {
      code: "AUTH_FORBIDDEN",
      http_status: 403,
      severity: "warn",
      category: "auth",
      message: "Access forbidden",
      description: "The authenticated user does not have permission to access this resource.",
      resolution: "Contact an administrator to adjust role permissions.",
      is_retryable: false,
    },
    {
      code: "AUTH_ADMIN_INVALID_CREDENTIALS",
      http_status: 401,
      severity: "warn",
      category: "auth",
      message: "Invalid admin credentials",
      description: "The email or password supplied for admin login is incorrect.",
      resolution: "Verify the credentials and try again.",
      is_retryable: true,
    },

    // ── BOOKING ───────────────────────────────────────────────────────────────
    {
      code: "BOOKING_NOT_FOUND",
      http_status: 404,
      severity: "warn",
      category: "booking",
      message: "Booking not found",
      description: "No booking exists for the provided booking reference or ID.",
      resolution: "Verify the booking reference and try again.",
      is_retryable: false,
    },
    {
      code: "BOOKING_SLOT_UNAVAILABLE",
      http_status: 409,
      severity: "warn",
      category: "booking",
      message: "Time slot is not available",
      description: "The requested theater slot is already booked for the selected date.",
      resolution: "Choose a different date or time slot.",
      is_retryable: false,
    },
    {
      code: "BOOKING_INVALID_DATE",
      http_status: 400,
      severity: "warn",
      category: "booking",
      message: "Invalid booking date",
      description: "The booking date is in the past or outside the permitted advance booking window.",
      resolution: "Select a valid future date.",
      is_retryable: false,
    },
    {
      code: "BOOKING_CAPACITY_EXCEEDED",
      http_status: 400,
      severity: "warn",
      category: "booking",
      message: "Theater capacity exceeded",
      description: "The total number of guests exceeds the maximum capacity of the theater.",
      resolution: "Reduce the number of guests or select a larger theater.",
      is_retryable: false,
    },
    {
      code: "BOOKING_ALREADY_CONFIRMED",
      http_status: 409,
      severity: "warn",
      category: "booking",
      message: "Booking is already confirmed",
      description: "An action was attempted on a booking that has already been confirmed.",
      resolution: "No action needed; the booking is already confirmed.",
      is_retryable: false,
    },
    {
      code: "BOOKING_ALREADY_CANCELLED",
      http_status: 409,
      severity: "warn",
      category: "booking",
      message: "Booking is already cancelled",
      description: "An action was attempted on a booking that has already been cancelled.",
      resolution: "Create a new booking if needed.",
      is_retryable: false,
    },
    {
      code: "BOOKING_CANCEL_NOT_ALLOWED",
      http_status: 400,
      severity: "warn",
      category: "booking",
      message: "Cancellation not allowed",
      description: "The booking cannot be cancelled because it is within the no-cancellation window.",
      resolution: "Contact support for assistance.",
      is_retryable: false,
    },

    // ── PAYMENT ───────────────────────────────────────────────────────────────
    {
      code: "PAYMENT_ORDER_CREATION_FAILED",
      http_status: 502,
      severity: "error",
      category: "payment",
      message: "Payment order creation failed",
      description: "Failed to create a payment order with the payment gateway (Razorpay/PhonePe).",
      resolution: "Retry the request. Check gateway credentials and connectivity.",
      is_retryable: true,
    },
    {
      code: "PAYMENT_VERIFICATION_FAILED",
      http_status: 400,
      severity: "error",
      category: "payment",
      message: "Payment verification failed",
      description: "The payment signature or status could not be verified with the gateway.",
      resolution: "Do not confirm the booking. Investigate the gateway response.",
      is_retryable: false,
    },
    {
      code: "PAYMENT_WEBHOOK_INVALID_SIGNATURE",
      http_status: 400,
      severity: "error",
      category: "payment",
      message: "Invalid webhook signature",
      description: "The HMAC signature on the incoming webhook does not match the expected value.",
      resolution: "Verify the webhook secret configuration on both the gateway and the server.",
      is_retryable: false,
    },
    {
      code: "PAYMENT_ALREADY_CAPTURED",
      http_status: 409,
      severity: "warn",
      category: "payment",
      message: "Payment has already been captured",
      description: "An attempt was made to capture a payment that has already been captured.",
      resolution: "No further action is needed.",
      is_retryable: false,
    },
    {
      code: "PAYMENT_REFUND_FAILED",
      http_status: 502,
      severity: "error",
      category: "payment",
      message: "Refund processing failed",
      description: "The refund request to the payment gateway failed.",
      resolution: "Retry the refund or process it manually from the gateway dashboard.",
      is_retryable: true,
    },

    // ── THEATER / AVAILABILITY ────────────────────────────────────────────────
    {
      code: "THEATER_NOT_FOUND",
      http_status: 404,
      severity: "warn",
      category: "theater",
      message: "Theater not found",
      description: "No theater exists for the provided ID or slug.",
      resolution: "Verify the theater identifier.",
      is_retryable: false,
    },
    {
      code: "THEATER_INACTIVE",
      http_status: 400,
      severity: "warn",
      category: "theater",
      message: "Theater is currently inactive",
      description: "The requested theater is not accepting bookings at this time.",
      resolution: "Choose an active theater.",
      is_retryable: false,
    },
    {
      code: "SLOT_NOT_FOUND",
      http_status: 404,
      severity: "warn",
      category: "theater",
      message: "Time slot not found",
      description: "The specified time slot does not exist for this theater.",
      resolution: "Choose a valid time slot.",
      is_retryable: false,
    },

    // ── COUPON ────────────────────────────────────────────────────────────────
    {
      code: "COUPON_NOT_FOUND",
      http_status: 404,
      severity: "warn",
      category: "coupon",
      message: "Coupon not found",
      description: "No coupon exists for the provided code.",
      resolution: "Check the coupon code and try again.",
      is_retryable: false,
    },
    {
      code: "COUPON_EXPIRED",
      http_status: 400,
      severity: "warn",
      category: "coupon",
      message: "Coupon has expired",
      description: "The coupon's validity period has ended.",
      resolution: "Use a different, active coupon.",
      is_retryable: false,
    },
    {
      code: "COUPON_MAX_USES_REACHED",
      http_status: 400,
      severity: "warn",
      category: "coupon",
      message: "Coupon usage limit reached",
      description: "The coupon has been used the maximum number of times allowed.",
      resolution: "Use a different coupon.",
      is_retryable: false,
    },
    {
      code: "COUPON_MIN_AMOUNT_NOT_MET",
      http_status: 400,
      severity: "warn",
      category: "coupon",
      message: "Minimum order amount not met for coupon",
      description: "The booking total is below the minimum amount required to apply this coupon.",
      resolution: "Add more items or choose a different coupon.",
      is_retryable: false,
    },
    {
      code: "COUPON_INACTIVE",
      http_status: 400,
      severity: "warn",
      category: "coupon",
      message: "Coupon is inactive",
      description: "The coupon exists but has been deactivated by an administrator.",
      resolution: "Use a different, active coupon.",
      is_retryable: false,
    },

    // ── VALIDATION ────────────────────────────────────────────────────────────
    {
      code: "VALIDATION_ERROR",
      http_status: 400,
      severity: "warn",
      category: "validation",
      message: "Validation error",
      description: "One or more request fields failed schema validation.",
      resolution: "Correct the invalid fields and resubmit the request.",
      is_retryable: false,
    },
    {
      code: "INVALID_PHONE_NUMBER",
      http_status: 400,
      severity: "warn",
      category: "validation",
      message: "Invalid phone number",
      description: "The phone number provided is not a valid Indian mobile number.",
      resolution: "Provide a valid 10-digit Indian mobile number.",
      is_retryable: false,
    },

    // ── EXTERNAL SERVICES ─────────────────────────────────────────────────────
    {
      code: "WHATSAPP_SEND_FAILED",
      http_status: 502,
      severity: "error",
      category: "external",
      message: "WhatsApp notification delivery failed",
      description: "The WATI API returned an error while attempting to send a WhatsApp message.",
      resolution: "Retry the notification. Check WATI API key and endpoint configuration.",
      is_retryable: true,
    },
    {
      code: "CLOUDINARY_UPLOAD_FAILED",
      http_status: 502,
      severity: "error",
      category: "external",
      message: "Image upload to Cloudinary failed",
      description: "Cloudinary returned an error during the image upload operation.",
      resolution: "Retry the upload. Verify Cloudinary credentials and file size limits.",
      is_retryable: true,
    },

    // ── SERVER / GENERIC ──────────────────────────────────────────────────────
    {
      code: "INTERNAL_SERVER_ERROR",
      http_status: 500,
      severity: "critical",
      category: "server",
      message: "An unexpected error occurred",
      description: "An unhandled exception or unexpected condition was encountered on the server.",
      resolution: "Check server logs for details and investigate the root cause.",
      is_retryable: false,
    },
    {
      code: "RESOURCE_NOT_FOUND",
      http_status: 404,
      severity: "warn",
      category: "server",
      message: "Resource not found",
      description: "The requested resource or route does not exist.",
      resolution: "Verify the URL and resource identifier.",
      is_retryable: false,
    },
    {
      code: "ERROR_CODE_UNKNOWN",
      http_status: 500,
      severity: "critical",
      category: "server",
      message: "Unknown error code",
      description: "An error occurred with an unrecognised error code — this should never happen in production.",
      resolution: "Add the missing error code to the ErrorMaster table and the application error registry.",
      is_retryable: false,
    },
  ];

  for (const error of errors) {
    await prisma.errorMaster.upsert({
      where: { code: error.code },
      update: {
        http_status: error.http_status,
        severity: error.severity,
        category: error.category,
        message: error.message,
        description: error.description,
        resolution: error.resolution ?? null,
        is_retryable: error.is_retryable,
      },
      create: {
        code: error.code,
        http_status: error.http_status,
        severity: error.severity,
        category: error.category,
        message: error.message,
        description: error.description,
        resolution: error.resolution ?? null,
        is_retryable: error.is_retryable,
      },
    });
  }

  console.log(`  ✓ ${errors.length} error codes upserted`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LOCATIONS & THEATERS & TIME SLOTS
// ─────────────────────────────────────────────────────────────────────────────

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

  // Mark old placeholder locations inactive
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

  // Mark old placeholder theaters inactive
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

  // ── Time slot template (4 slots per theater) ─────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADDONS
// ─────────────────────────────────────────────────────────────────────────────

async function seedAddons(): Promise<void> {
  console.log("Seeding addons …");

  type AddonSeed = {
    category: string;
    name: string;
    description: string;
    price: number;
    sort_order: number;
  };

  const addons: AddonSeed[] = [
    // ── Decoration ────────────────────────────────────────────────────────────
    {
      category: "decoration",
      name: "Fog Effect",
      description: "Dramatic fog machine effect to create a cinematic ambiance.",
      price: 349,
      sort_order: 1,
    },
    {
      category: "decoration",
      name: "Photo Clippings",
      description: "Personalized photo clippings displayed around your private theater.",
      price: 349,
      sort_order: 2,
    },
    {
      category: "decoration",
      name: "Cold Fire 2pc",
      description: "Two cold-fire sparkler sticks for a spectacular visual effect.",
      price: 750,
      sort_order: 3,
    },
    {
      category: "decoration",
      name: "Candle Path",
      description: "A romantic candle-lit pathway leading into your private theater.",
      price: 250,
      sort_order: 4,
    },
    {
      category: "decoration",
      name: "Party Props",
      description: "A set of fun party props including hats, glasses, and banners.",
      price: 199,
      sort_order: 5,
    },
    {
      category: "decoration",
      name: "LED Numbers",
      description: "Glowing LED number props — perfect for milestone birthdays or anniversaries.",
      price: 99,
      sort_order: 6,
    },
    {
      category: "decoration",
      name: "HBD Letters",
      description: "Illuminated HBD (Happy Birthday) letter props for birthday celebrations.",
      price: 99,
      sort_order: 7,
    },

    // ── Rose ──────────────────────────────────────────────────────────────────
    {
      category: "rose",
      name: "Single Rose",
      description: "A single fresh rose — a small but meaningful romantic gesture.",
      price: 49,
      sort_order: 1,
    },
    {
      category: "rose",
      name: "Rose Bouquet",
      description: "A beautiful bouquet of fresh roses to make the occasion extra special.",
      price: 349,
      sort_order: 2,
    },

    // ── Photography ───────────────────────────────────────────────────────────
    {
      category: "photography",
      name: "Photography 20pics",
      description: "Professional in-theater photography — 20 edited digital photos delivered.",
      price: 299,
      sort_order: 1,
    },
    {
      category: "photography",
      name: "Photography 50pics",
      description: "Professional in-theater photography — 50 edited digital photos delivered.",
      price: 499,
      sort_order: 2,
    },
    {
      category: "photography",
      name: "Photography 100pics",
      description: "Professional in-theater photography — 100 edited digital photos delivered.",
      price: 999,
      sort_order: 3,
    },
    {
      category: "photography",
      name: "Photography 1hr",
      description: "One full hour of professional in-theater photography coverage.",
      price: 1499,
      sort_order: 4,
    },
  ];

  for (const addon of addons) {
    const existing = await prisma.addon.findFirst({
      where: { name: addon.name, category: addon.category },
    });
    if (!existing) {
      await prisma.addon.create({
        data: {
          category: addon.category,
          name: addon.name,
          description: addon.description,
          price: addon.price,
          is_active: true,
          sort_order: addon.sort_order,
        },
      });
    }
  }

  console.log(`  ✓ ${addons.length} addons seeded`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CAKES
// ─────────────────────────────────────────────────────────────────────────────

async function seedCakes(): Promise<void> {
  console.log("Seeding cakes …");

  type CakeSeed = {
    name: string;
    flavor: string;
    price: number;
    is_eggless: boolean;
    sort_order: number;
  };

  const cakeFlavors = [
    { flavor: "Vanilla", basePrice: 500 },
    { flavor: "Chocolate", basePrice: 600 },
    { flavor: "Dark Chocolate", basePrice: 600 },
    { flavor: "Black Forest", basePrice: 600 },
    { flavor: "Strawberry", basePrice: 550 },
  ];

  const cakes: CakeSeed[] = [];
  let sortOrder = 1;

  for (const { flavor, basePrice } of cakeFlavors) {
    // With-egg variant
    cakes.push({
      name: `${flavor} Cake`,
      flavor,
      price: basePrice,
      is_eggless: false,
      sort_order: sortOrder++,
    });
    // Eggless variant (+Rs 50)
    cakes.push({
      name: `${flavor} Cake (Eggless)`,
      flavor,
      price: basePrice + 50,
      is_eggless: true,
      sort_order: sortOrder++,
    });
  }

  for (const cake of cakes) {
    const existing = await prisma.cake.findFirst({
      where: { name: cake.name, is_eggless: cake.is_eggless },
    });
    if (!existing) {
      await prisma.cake.create({
        data: {
          name: cake.name,
          flavor: cake.flavor,
          price: cake.price,
          is_eggless: cake.is_eggless,
          is_active: true,
          sort_order: cake.sort_order,
        },
      });
    }
  }

  console.log(`  ✓ ${cakes.length} cakes seeded (5 flavors × 2 variants)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FOOD CATEGORIES & ITEMS
// ─────────────────────────────────────────────────────────────────────────────

async function seedFoodCategoriesAndItems(): Promise<void> {
  console.log("Seeding food categories and items …");

  type FoodItemSeed = {
    name: string;
    description: string;
    price: number;
    is_veg: boolean;
  };

  type FoodCategorySeed = {
    name: string;
    sort_order: number;
    items: FoodItemSeed[];
  };

  const categories: FoodCategorySeed[] = [
    {
      name: "Snacks",
      sort_order: 1,
      items: [
        {
          name: "Masala Fries",
          description: "Crispy golden fries tossed with our signature spice blend.",
          price: 149,
          is_veg: true,
        },
        {
          name: "Cheese Nachos",
          description: "Crunchy tortilla chips loaded with warm nacho cheese dip.",
          price: 199,
          is_veg: true,
        },
        {
          name: "Popcorn (Butter)",
          description: "Classic buttered popcorn — the perfect movie companion.",
          price: 99,
          is_veg: true,
        },
      ],
    },
    {
      name: "Mains",
      sort_order: 2,
      items: [
        {
          name: "Veg Burger",
          description: "A hearty veggie patty burger with fresh lettuce, tomato, and house sauce.",
          price: 249,
          is_veg: true,
        },
        {
          name: "Paneer Wrap",
          description: "Grilled paneer tikka wrapped in a warm whole-wheat tortilla with mint chutney.",
          price: 279,
          is_veg: true,
        },
        {
          name: "Margherita Pizza (7\")",
          description: "Classic thin-crust Margherita pizza topped with mozzarella and fresh basil.",
          price: 349,
          is_veg: true,
        },
      ],
    },
    {
      name: "Thickshakes",
      sort_order: 3,
      items: [
        {
          name: "Chocolate Thickshake",
          description: "Rich, creamy chocolate thickshake blended with premium cocoa ice cream.",
          price: 199,
          is_veg: true,
        },
        {
          name: "Strawberry Thickshake",
          description: "Velvety strawberry thickshake made with fresh fruit and creamy ice cream.",
          price: 199,
          is_veg: true,
        },
        {
          name: "Vanilla Thickshake",
          description: "Classic vanilla thickshake — smooth, sweet, and utterly indulgent.",
          price: 179,
          is_veg: true,
        },
      ],
    },
    {
      name: "Mojitos",
      sort_order: 4,
      items: [
        {
          name: "Classic Mint Mojito",
          description: "Refreshing virgin mojito with fresh mint, lime, and sparkling water.",
          price: 149,
          is_veg: true,
        },
        {
          name: "Watermelon Mojito",
          description: "Chilled watermelon mojito with a hint of mint and a splash of soda.",
          price: 159,
          is_veg: true,
        },
        {
          name: "Blue Lagoon Mojito",
          description: "Stunning blue-hued mojito with blue curacao syrup, lime, and soda.",
          price: 169,
          is_veg: true,
        },
      ],
    },
    {
      name: "Ice Cream",
      sort_order: 5,
      items: [
        {
          name: "Vanilla Ice Cream (2 scoops)",
          description: "Two generous scoops of classic Madagascar vanilla bean ice cream.",
          price: 129,
          is_veg: true,
        },
        {
          name: "Chocolate Brownie Sundae",
          description: "Warm chocolate brownie topped with vanilla ice cream and hot fudge sauce.",
          price: 249,
          is_veg: true,
        },
        {
          name: "Mango Sorbet",
          description: "Refreshing dairy-free Alphonso mango sorbet — light, fruity, and delicious.",
          price: 149,
          is_veg: true,
        },
      ],
    },
  ];

  for (const cat of categories) {
    // FoodCategory uses a UUID primary key, so we find-or-create by name.
    let category = await prisma.foodCategory.findFirst({ where: { name: cat.name } });
    if (!category) {
      category = await prisma.foodCategory.create({
        data: { name: cat.name, sort_order: cat.sort_order, is_active: true },
      });
    } else {
      category = await prisma.foodCategory.update({
        where: { id: category.id },
        data: { sort_order: cat.sort_order },
      });
    }

    for (const item of cat.items) {
      const existingItem = await prisma.foodItem.findFirst({
        where: { name: item.name, category_id: category.id },
      });
      if (!existingItem) {
        await prisma.foodItem.create({
          data: {
            category_id: category.id,
            name: item.name,
            description: item.description,
            price: item.price,
            is_veg: item.is_veg,
            is_available: true,
          },
        });
      }
    }

    console.log(`  ✓ Category "${cat.name}" + ${cat.items.length} items`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN
// ─────────────────────────────────────────────────────────────────────────────

async function seedAdmin(): Promise<void> {
  console.log("Seeding default admin …");

  const passwordHash = await hashPassword("Admin@123");

  await prisma.admin.upsert({
    where: { email: "admin@themagicshow.com" },
    update: {
      role: "super_admin",
      is_active: true,
    },
    create: {
      email: "admin@themagicshow.com",
      password_hash: passwordHash,
      role: "super_admin",
      is_active: true,
    },
  });

  console.log("  ✓ Admin admin@themagicshow.com (super_admin) seeded");
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SITE SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

async function seedSiteSettings(): Promise<void> {
  console.log("Seeding site settings …");

  const settings: { key: string; value: string }[] = [
    { key: "business_name", value: "theMagicshow" },
    { key: "whatsapp_number", value: "919999999999" },
    { key: "advance_amount", value: "700" },
    { key: "refundable_amount", value: "500" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  console.log(`  ✓ ${settings.length} site settings upserted`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n========================================");
  console.log("  theMagicshow — Database Seed");
  console.log("========================================\n");

  await prisma.$transaction(async () => {
    await seedErrorMaster();
  });

  // Locations, theaters, and slots are seeded outside the transaction because
  // they involve multiple sequential upserts with FK dependencies.
  await seedLocationsTheatersSlots();

  await prisma.$transaction(async () => {
    // Addons, cakes, food, admin, and settings are independent — run in one
    // transaction for atomicity.
    await seedAddons();
    await seedCakes();
  });

  // Food categories use find-or-create logic with async error fallback,
  // which requires its own sequential context.
  await seedFoodCategoriesAndItems();

  await prisma.$transaction(async () => {
    await seedAdmin();
    await seedSiteSettings();
  });

  console.log("\n========================================");
  console.log("  Seed completed successfully.");
  console.log("========================================\n");
}

main()
  .catch((err) => {
    console.error("\n[SEED ERROR]", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
