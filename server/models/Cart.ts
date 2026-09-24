import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ICart extends Document {
  cartId: string;
  customerId?: string;
  sessionId: string;
  items: ICartItem[];
  subtotal: number;
  itemCount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  variantId: { type: String, required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const CartSchema = new Schema<ICart>({
  cartId: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  items: [CartItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  itemCount: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, {
  timestamps: true
});

export const CartModel = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
