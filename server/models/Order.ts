import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 
  | 'Pending'
  | 'Authorized'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'Partially Refunded';

export interface IOrderItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
  alterationRequested?: boolean;
}

export interface IOrderStatusHistory {
  previousStatus: string;
  newStatus: string;
  changedBy: {
    id: string;
    name: string;
    role: string;
  };
  note?: string;
  timestamp: Date;
}

export interface IShipment { carrier?: string; trackingId?: string; trackingUrl?: string; status: 'Pending'|'Shipped'|'In Transit'|'Out for Delivery'|'Delivered'; estimatedDelivery?: string; notes?: string; shippedAt?: Date; deliveredAt?: Date; }\n\nexport interface ITaxSnapshot { state:string; rate:number; taxableAmount:number; amount:number; calculationVersion:string; details?:string; }\n\nexport interface IShippingInfo {
  recipientName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  carrier?: string;
  shippingMethod: string;
  estimatedDelivery?: string;
}

export interface IOrder extends Document {
  orderId: string; // e.g. PA-2026-000001
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: string;
  paymentTransactionId?: string;
  shippingInfo: IShippingInfo;
  trackingNumber?: string;
  statusHistory: IOrderStatusHistory[];
  timeline: Array<{ status:string; timestamp:string; description:string; completed:boolean; location?:string }>;
  notes?: string;
  alterationIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  variantId: { type: String, required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  alterationRequested: { type: Boolean, default: false }
}, { _id: false });

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  changedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  note: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ShipmentSchema = new Schema<IShipment>({ carrier: String, trackingId: String, trackingUrl: String, status: { type:String, enum:['Pending','Shipped','In Transit','Out for Delivery','Delivered'], default:'Pending' }, estimatedDelivery:String, notes:String, shippedAt:Date, deliveredAt:Date }, { _id:false });\nconst TaxSnapshotSchema = new Schema<ITaxSnapshot>({ state:String, rate:Number, taxableAmount:Number, amount:Number, calculationVersion:String, details:String }, { _id:false });\n\nconst ShippingInfoSchema = new Schema<IShippingInfo>({
  recipientName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'United States' },
  carrier: { type: String, default: 'Park Avenue White Glove Courier' },
  shippingMethod: { type: String, default: 'Complimentary Express' },
  estimatedDelivery: { type: String }
}, { _id: false });

const TimelineSchema = new Schema({ status:String, timestamp:String, description:String, completed:Boolean, location:String }, { _id:false });

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, index: true },
  customerName: { type: String, required: true, index: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  customerPhone: { type: String, required: true, trim: true, index: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  shipping: { type: Number, required: true, default: 0, min: 0 },
  tax: { type: Number, required: true, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Authorized', 'Paid', 'Failed', 'Refunded', 'Partially Refunded'],
    default: 'Pending',
    index: true 
  },
  orderStatus: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true 
  },
  paymentMethod: { type: String, default: 'Credit Card (Processed)' },
  paymentTransactionId: { type: String },
  shippingInfo: { type: ShippingInfoSchema, required: true },
  trackingNumber: { type: String, index: true },
  statusHistory: [OrderStatusHistorySchema],
  timeline: { type:[TimelineSchema], default:[] },
  notes: { type: String },
  alterationIds: [{ type: String }]
}, {
  timestamps: true
});

OrderSchema.index({ customerEmail: 1, orderId: 1 });
OrderSchema.index({ customerPhone: 1, orderId: 1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
