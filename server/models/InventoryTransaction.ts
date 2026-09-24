import mongoose, { Schema, Document } from 'mongoose';

export type InventoryTransactionReason = 
  | 'purchase'
  | 'order_fulfillment'
  | 'order_cancellation'
  | 'manual_adjustment'
  | 'damage'
  | 'restock'
  | 'return'
  | 'initial_stock';

export interface IInventoryTransaction extends Document {
  transactionId: string;
  productId: string;
  productName: string;
  sku: string;
  variantId?: string;
  variantDetails?: {
    size?: string;
    color?: string;
  };
  previousQuantity: number;
  newQuantity: number;
  quantityChanged: number;
  reason: InventoryTransactionReason;
  adminUser: {
    id: string;
    name: string;
    email: string;
  };
  notes?: string;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>({
  transactionId: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true, index: true },
  variantId: { type: String },
  variantDetails: {
    size: { type: String },
    color: { type: String }
  },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true, min: 0 },
  quantityChanged: { type: Number, required: true },
  reason: { 
    type: String, 
    required: true,
    enum: ['purchase', 'order_fulfillment', 'order_cancellation', 'manual_adjustment', 'damage', 'restock', 'return', 'initial_stock'],
    index: true
  },
  adminUser: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  notes: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

InventoryTransactionSchema.index({ productId: 1, createdAt: -1 });

export const InventoryTransactionModel = 
  mongoose.models.InventoryTransaction || 
  mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
