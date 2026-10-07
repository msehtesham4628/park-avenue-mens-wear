import mongoose, { Schema, Document } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed';

export interface ICoupon extends Document {
  couponId: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 15 for 15%, or 50 for $50
  minOrderAmount: number; // minimum cart subtotal required
  maxDiscountAmount?: number; // optional cap for percentage discounts
  expiresAt?: Date | null;
  usageLimit?: number | null; // maximum times coupon can be used
  usedCount: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  couponId: { type: String, required: true, unique: true, index: true },
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true, 
    index: true 
  },
  description: { type: String, trim: true },
  discountType: { 
    type: String, 
    required: true, 
    enum: ['percentage', 'fixed'], 
    default: 'percentage' 
  },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  maxDiscountAmount: { type: Number, min: 0 },
  expiresAt: { type: Date },
  usageLimit: { type: Number, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: String, default: 'Atelier Administrator' }
}, {
  timestamps: true
});

CouponSchema.index({ code: 1, isActive: 1 });

export const CouponModel = 
  mongoose.models.Coupon || 
  mongoose.model<ICoupon>('Coupon', CouponSchema);
