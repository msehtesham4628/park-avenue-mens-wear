import mongoose from 'mongoose';
import { CouponModel, ICoupon } from '../models/Coupon.js';

export interface CreateCouponInput {
  code: string;
  discountType?: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: Date | string | null;
  usageLimit?: number | null;
  description?: string;
  isActive?: boolean;
  createdBy?: string;
}

// In-memory fallback ledger for offline resilience
const runtimeCouponsLedger: any[] = [
  {
    couponId: 'CPN-DEFAULT-BESPOKE10',
    code: 'BESPOKE10',
    description: 'Complimentary 10% Welcome Atelier Privilege',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    isActive: true,
    usedCount: 0,
    createdAt: new Date()
  },
  {
    couponId: 'CPN-DEFAULT-WELCOME10',
    code: 'WELCOME10',
    description: 'First Commission Patron 10% Discount',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    isActive: true,
    usedCount: 0,
    createdAt: new Date()
  },
  {
    couponId: 'CPN-DEFAULT-PARKAVENUE',
    code: 'PARKAVENUE',
    description: 'Executive Heritage 15% VIP Allowance',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 150,
    isActive: true,
    usedCount: 0,
    createdAt: new Date()
  }
];

export class CouponService {
  /**
   * Get all coupons for Admin Dashboard
   */
  async getAllCoupons(): Promise<any[]> {
    try {
      const coupons = await CouponModel.find({}).sort({ createdAt: -1 }).lean();
      if (coupons && coupons.length > 0) {
        return coupons;
      }
    } catch (err: any) {
      console.warn('[CouponService] Database read failed, using runtime ledger:', err?.message);
    }
    return runtimeCouponsLedger;
  }

  /**
   * Validate a coupon code for Cart & Checkout
   */
  async validateCoupon(rawCode: string, subtotal: number = 0): Promise<{
    valid: boolean;
    coupon?: any;
    discountAmount: number;
    message: string;
  }> {
    const cleanCode = (rawCode || '').trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmount: 0, message: 'Please provide a coupon code.' };
    }

    let coupon: any = null;

    try {
      coupon = await CouponModel.findOne({ code: cleanCode }).lean();
    } catch {}

    if (!coupon) {
      coupon = runtimeCouponsLedger.find(c => c.code === cleanCode);
    }

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" is invalid or does not exist.` };
    }

    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" is no longer active.` };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" expired on ${new Date(coupon.expiresAt).toLocaleDateString()}.` };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" has reached its maximum usage limit.` };
    }

    if (coupon.minOrderAmount && subtotal > 0 && subtotal < coupon.minOrderAmount) {
      return { 
        valid: false, 
        discountAmount: 0, 
        message: `Coupon "${cleanCode}" requires a minimum order of $${coupon.minOrderAmount.toFixed(2)}. Current subtotal: $${subtotal.toFixed(2)}.` 
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed amount discount
      discountAmount = Math.min(subtotal, coupon.discountValue);
    }

    return {
      valid: true,
      coupon: {
        id: coupon.couponId || coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount || 0,
        description: coupon.description
      },
      discountAmount: Number(discountAmount.toFixed(2)),
      message: `Coupon "${cleanCode}" applied successfully!`
    };
  }

  /**
   * Create a new coupon (Admin Dashboard)
   */
  async createCoupon(data: CreateCouponInput): Promise<any> {
    const cleanCode = data.code.trim().toUpperCase();
    if (!cleanCode) {
      throw new Error('Coupon code is required.');
    }
    if (data.discountValue === undefined || data.discountValue === null || data.discountValue <= 0) {
      throw new Error('Valid discount value is required.');
    }

    const couponId = `CPN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    const newCouponData = {
      couponId,
      code: cleanCode,
      description: data.description?.trim() || `${data.discountType === 'fixed' ? `$${data.discountValue}` : `${data.discountValue}%`} Promotional Privilege`,
      discountType: data.discountType || 'percentage',
      discountValue: Number(data.discountValue),
      minOrderAmount: Number(data.minOrderAmount || 0),
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
      expiresAt,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      usedCount: 0,
      isActive: data.isActive !== false,
      createdBy: data.createdBy || 'Atelier Administrator',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Check for duplicate in DB
      const existing = await CouponModel.findOne({ code: cleanCode });
      if (existing) {
        throw new Error(`A coupon with code "${cleanCode}" already exists.`);
      }

      const created = await CouponModel.create(newCouponData);
      runtimeCouponsLedger.unshift(newCouponData);
      return created.toObject ? created.toObject() : newCouponData;
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        throw err;
      }
      // If DB error, push to runtime ledger
      const existingInMemory = runtimeCouponsLedger.find(c => c.code === cleanCode);
      if (existingInMemory) {
        throw new Error(`A coupon with code "${cleanCode}" already exists.`);
      }
      runtimeCouponsLedger.unshift(newCouponData);
      return newCouponData;
    }
  }

  /**
   * Delete a coupon (Admin Dashboard)
   */
  async deleteCoupon(idOrCode: string): Promise<boolean> {
    const cleanTarget = (idOrCode || '').trim();
    if (!cleanTarget) {
      throw new Error('Coupon ID or code is required.');
    }

    try {
      const query: any[] = [
        { couponId: cleanTarget },
        { code: cleanTarget.toUpperCase() }
      ];
      if (mongoose.Types.ObjectId.isValid(cleanTarget)) {
        query.push({ _id: cleanTarget });
      }

      await CouponModel.deleteOne({ $or: query });
    } catch (err: any) {
      console.warn('[CouponService] DB delete error:', err?.message);
    }

    // Also remove from runtime ledger
    const upper = cleanTarget.toUpperCase();
    const idx = runtimeCouponsLedger.findIndex(c => 
      c.couponId === cleanTarget || 
      c.code === upper || 
      String(c._id) === cleanTarget
    );
    if (idx !== -1) {
      runtimeCouponsLedger.splice(idx, 1);
    }

    return true;
  }

  /**
   * Record usage of a coupon
   */
  async recordUsage(code: string): Promise<void> {
    const cleanCode = (code || '').trim().toUpperCase();
    try {
      await CouponModel.updateOne({ code: cleanCode }, { $inc: { usedCount: 1 } });
    } catch {}

    const memoryItem = runtimeCouponsLedger.find(c => c.code === cleanCode);
    if (memoryItem) {
      memoryItem.usedCount = (memoryItem.usedCount || 0) + 1;
    }
  }
}

export const couponService = new CouponService();
