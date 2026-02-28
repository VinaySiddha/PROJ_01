/**
 * admin/coupons.service.ts
 * CRUD operations for coupon codes.
 */
import { prisma } from '../../prisma/client';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { AuditService } from '../audit.service';

/** Input shape for creating a new coupon */
export interface CreateCouponInput {
  code:       string;
  type:       'percent' | 'flat';
  value:      number;
  minAmount:  number;
  maxUses:    number;
  validFrom:  string;
  validUntil: string;
}

export class CouponsService {
  /**
   * Creates a new coupon code.
   * Throws ConflictError if the code is already taken.
   *
   * @param input   - Coupon creation parameters
   * @param adminId - Admin performing the action (for audit log)
   */
  static async create(input: CreateCouponInput, adminId: string) {
    const existing = await prisma.coupon.findFirst({ where: { code: input.code } });
    if (existing) throw new ConflictError('COUPON_CODE_EXISTS', `Coupon code '${input.code}' already exists.`);

    const coupon = await prisma.coupon.create({
      data: {
        code:        input.code,
        type:        input.type,
        value:       input.value,
        min_amount:  input.minAmount,
        max_uses:    input.maxUses,
        valid_from:  new Date(input.validFrom),
        valid_until: new Date(input.validUntil),
        is_active:   true,
      },
    });

    AuditService.log({
      actorType:    'admin',
      actorId:      adminId,
      action:       'coupon.created',
      category:     'coupon',
      resourceType: 'coupon',
      resourceId:   coupon.id,
    });

    return coupon;
  }

  /**
   * Lists all coupons with usage stats, ordered by expiry date descending.
   */
  static async list() {
    return prisma.coupon.findMany({ orderBy: { valid_until: 'desc' } });
  }

  /**
   * Disables a coupon without deleting it.
   * Disabled coupons cannot be applied at checkout.
   *
   * @param couponId - Coupon UUID
   * @param adminId  - Admin performing the action (for audit log)
   */
  static async disable(couponId: string, adminId: string) {
    const coupon = await prisma.coupon.findFirst({ where: { id: couponId } });
    if (!coupon) throw new NotFoundError('Coupon', couponId);

    const updated = await prisma.coupon.update({ where: { id: couponId }, data: { is_active: false } });

    AuditService.log({
      actorType:    'admin',
      actorId:      adminId,
      action:       'coupon.disabled',
      category:     'coupon',
      resourceType: 'coupon',
      resourceId:   couponId,
    });

    return updated;
  }
}
