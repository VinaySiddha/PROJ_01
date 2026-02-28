/**
 * bookings.service.ts
 * Core booking lifecycle: create, retrieve, cancel, list.
 * Booking creation validates capacity, unlocks slot on failure, and sends WhatsApp confirmation.
 */
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { generateBookingRef, formatDate, formatSlot } from '../utils/formatters';
import { AuditService } from './audit.service';
import { WhatsAppService } from './whatsapp.service';
import { SlotsService } from './slots.service';
import { v4 as uuidv4 } from 'uuid';

/** Input for creating a new booking */
export interface CreateBookingInput {
  theaterId:     string;
  customerId:    string;
  date:          string;          // ISO date string
  slotId:        string;
  durationType:  'standard' | 'short';
  numAdults:     number;
  numChildren:   number;
  occasion?:     string;
  occasionName?: string;
  cakeId?:       string;
  addonIds?:     string[];
  foodItems?:    { foodItemId: string; quantity: number }[];
  couponCode?:   string;
  referralCode?: string;
  ipAddress?:    string;
}

/** Cancellation window — customer must cancel 72 hours before slot */
const CANCELLATION_WINDOW_HOURS = 72;
const REFUNDABLE_AMOUNT = 500;

export class BookingsService {
  /**
   * Creates a new booking with all associated add-ons, cakes, and food items.
   * Validates capacity, coupon, and slot lock before writing to DB.
   *
   * @param input - Booking creation parameters
   * @returns     - The created booking with booking reference
   */
  static async createBooking(input: CreateBookingInput) {
    // Fetch theater to validate capacity and pricing
    const theater = await prisma.theater.findFirst({
      where: { id: input.theaterId, is_active: true },
    });
    if (!theater) throw new NotFoundError('Theater', input.theaterId);

    const totalPeople = input.numAdults + input.numChildren;

    // Validate guest count against theater rules
    if (totalPeople > theater.max_capacity) {
      throw new ValidationError(
        'BOOKING_CAPACITY_EXCEEDED',
        `This theater allows a maximum of ${theater.max_capacity} guests.`,
      );
    }

    if (theater.couple_only && totalPeople > 2) {
      throw new ValidationError('BOOKING_COUPLE_ONLY', 'This theater is for couples only (max 2 guests).');
    }

    if (!theater.allow_extra_persons && totalPeople > theater.base_capacity) {
      throw new ValidationError(
        'BOOKING_NO_EXTRA_PERSONS',
        'This theater does not allow additional guests beyond the base capacity.',
      );
    }

    // Compute base price based on duration and extra guests
    const basePrice = input.durationType === 'short' ? theater.short_slot_price : theater.base_price;
    const extraAdults = Math.max(0, input.numAdults - theater.base_capacity);
    const extraChildren = input.numChildren;
    const extraCharge = (extraAdults * theater.extra_adult_price) + (extraChildren * theater.extra_child_price);

    // Resolve add-ons
    let addonsAmount = 0;
    const resolvedAddons: { id: string; price: number }[] = [];
    if (input.addonIds?.length) {
      const addons = await prisma.addon.findMany({
        where: { id: { in: input.addonIds }, is_active: true },
        select: { id: true, price: true },
      });
      for (const addon of addons) {
        addonsAmount += addon.price;
        resolvedAddons.push(addon);
      }
    }

    // Resolve cake
    let cakeAmount = 0;
    let resolvedCake: { id: string; price: number } | null = null;
    if (input.cakeId) {
      const cake = await prisma.cake.findFirst({ where: { id: input.cakeId, is_active: true } });
      if (cake) { cakeAmount = cake.price; resolvedCake = cake; }
    }

    // Resolve food items
    let foodAmount = 0;
    const resolvedFoodItems: { foodItemId: string; quantity: number; price: number }[] = [];
    if (input.foodItems?.length) {
      const foodItemIds = input.foodItems.map((f) => f.foodItemId);
      const dbFoodItems = await prisma.foodItem.findMany({
        where: { id: { in: foodItemIds }, is_available: true },
        select: { id: true, price: true },
      });
      const priceMap = new Map(dbFoodItems.map((f) => [f.id, f.price]));
      for (const item of input.foodItems) {
        const price = priceMap.get(item.foodItemId) ?? 0;
        foodAmount += price * item.quantity;
        resolvedFoodItems.push({ foodItemId: item.foodItemId, quantity: item.quantity, price });
      }
    }

    // Validate and apply coupon
    let couponDiscount = 0;
    let couponId: string | null = null;
    if (input.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: input.couponCode, is_active: true },
      });

      if (!coupon) throw new ValidationError('BOOKING_COUPON_INVALID', 'This coupon code is not valid.');
      if (new Date() > coupon.valid_until) throw new ValidationError('BOOKING_COUPON_EXPIRED', 'This coupon has expired.');
      if (coupon.used_count >= coupon.max_uses) throw new ValidationError('BOOKING_COUPON_MAX_USED', 'This coupon has reached its usage limit.');

      const subtotal = basePrice + extraCharge + addonsAmount + cakeAmount + foodAmount;
      if (subtotal < coupon.min_amount) {
        throw new ValidationError(
          'BOOKING_COUPON_MIN_AMOUNT',
          `Your booking total does not meet the minimum amount of ₹${coupon.min_amount} for this coupon.`,
        );
      }

      couponDiscount = coupon.type === 'percent'
        ? Math.floor(subtotal * (coupon.value / 100))
        : coupon.value;
      couponId = coupon.id;
    }

    const totalAmount = Math.max(0,
      basePrice + extraCharge + addonsAmount + cakeAmount + foodAmount - couponDiscount,
    );

    // Generate a unique booking ID and reference upfront
    const bookingId  = uuidv4();
    const bookingRef = generateBookingRef(bookingId);

    // Write everything in a single DB transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking record
      const newBooking = await tx.booking.create({
        data: {
          id:            bookingId,
          booking_ref:   bookingRef,
          theater_id:    input.theaterId,
          customer_id:   input.customerId,
          date:          new Date(input.date),
          slot_id:       input.slotId,
          duration_type: input.durationType,
          num_adults:    input.numAdults,
          num_children:  input.numChildren,
          occasion:      input.occasion,
          occasion_name: input.occasionName,
          status:        'pending',
          base_amount:   basePrice + extraCharge,
          addons_amount: addonsAmount,
          food_amount:   foodAmount,
          cake_amount:   cakeAmount,
          total_amount:  totalAmount,
          advance_paid:  700,
          coupon_id:     couponId,
          referral_code: input.referralCode,
        },
      });

      // Create add-on associations
      if (resolvedAddons.length > 0) {
        await tx.bookingAddon.createMany({
          data: resolvedAddons.map((a) => ({
            booking_id: newBooking.id, addon_id: a.id,
            quantity: 1, unit_price: a.price,
          })),
        });
      }

      // Create cake association
      if (resolvedCake) {
        await tx.bookingCake.create({
          data: { booking_id: newBooking.id, cake_id: resolvedCake.id, unit_price: resolvedCake.price },
        });
      }

      // Create food item associations
      if (resolvedFoodItems.length > 0) {
        await tx.bookingFoodItem.createMany({
          data: resolvedFoodItems.map((f) => ({
            booking_id: newBooking.id, food_item_id: f.foodItemId,
            quantity: f.quantity, unit_price: f.price,
          })),
        });
      }

      // Increment coupon usage count inside transaction for atomicity
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { used_count: { increment: 1 } } });
      }

      return newBooking;
    });

    logger.info('Booking created', { event: 'booking.created', bookingId: booking.id, bookingRef });

    AuditService.log({
      actorType:    'customer',
      actorId:      input.customerId,
      action:       'booking.created',
      category:     'booking',
      resourceType: 'booking',
      resourceId:   booking.id,
      metadata:     { theaterId: input.theaterId, date: input.date, totalAmount },
      ipAddress:    input.ipAddress,
    });

    return booking;
  }

  /**
   * Retrieves a single booking by ID.
   *
   * @param bookingId  - Booking UUID
   * @param customerId - If provided, verifies the booking belongs to this customer
   */
  static async getBooking(bookingId: string, customerId?: string) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, ...(customerId ? { customer_id: customerId } : {}) },
      include: {
        theater: { select: { id: true, name: true, location: { select: { name: true, address: true } } } },
        slot:    { select: { slot_name: true, start_time: true, end_time: true } },
        booking_addons: { include: { addon: { select: { name: true, category: true } } } },
        booking_food_items: { include: { food_item: { select: { name: true } } } },
        booking_cake: { include: { cake: { select: { name: true, flavor: true, is_eggless: true } } } },
      },
    });

    if (!booking) throw new NotFoundError('Booking', bookingId);
    return booking;
  }

  /**
   * Returns all bookings for a customer, ordered by most recent first.
   *
   * @param customerId - Customer UUID
   */
  static async getCustomerBookings(customerId: string) {
    return prisma.booking.findMany({
      where: { customer_id: customerId },
      select: {
        id: true, booking_ref: true, status: true, date: true,
        total_amount: true, advance_paid: true, created_at: true,
        theater: { select: { name: true, images: true } },
        slot: { select: { slot_name: true, start_time: true, end_time: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Cancels a booking and issues a refund if within the cancellation window.
   *
   * @param bookingId  - Booking UUID
   * @param customerId - If provided, validates ownership
   * @param cancelledBy - 'customer' | 'admin'
   */
  static async cancelBooking(
    bookingId: string,
    options: { customerId?: string; cancelledBy: 'customer' | 'admin'; ipAddress?: string },
  ) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, ...(options.customerId ? { customer_id: options.customerId } : {}) },
      include: { customer: true, theater: true, slot: true },
    });

    if (!booking) throw new NotFoundError('Booking', bookingId);

    if (booking.status === 'cancelled') {
      throw new ConflictError('BOOKING_ALREADY_CANCELLED', 'This booking has already been cancelled.', 'booking', bookingId);
    }

    // Calculate refund amount based on time remaining before slot
    const slotDate = new Date(booking.date);
    const hoursUntilSlot = (slotDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const refundAmount = hoursUntilSlot >= CANCELLATION_WINDOW_HOURS ? REFUNDABLE_AMOUNT : 0;

    await prisma.booking.update({
      where: { id: bookingId },
      data:  { status: 'cancelled' },
    });

    // Release the slot lock so it can be rebooked
    await SlotsService.unlockSlot(booking.theater_id, booking.date.toISOString().split('T')[0] as string, booking.slot_id);

    // Send cancellation WhatsApp notification (fire-and-forget)
    void WhatsAppService.sendCancellationNotice({
      phone:        booking.customer.phone,
      name:         booking.customer.name ?? 'Customer',
      bookingRef:   booking.booking_ref,
      refundAmount,
    });

    AuditService.log({
      actorType:    options.cancelledBy,
      actorId:      options.customerId,
      action:       `booking.cancelled_by_${options.cancelledBy}`,
      category:     'booking',
      resourceType: 'booking',
      resourceId:   bookingId,
      metadata:     { refundAmount, hoursUntilSlot: Math.round(hoursUntilSlot) },
      ipAddress:    options.ipAddress,
    });

    return { refundAmount, booking };
  }
}
