import mongoose, { Schema, Document } from 'mongoose';

export type ReturnActionType = 
  | 'Size / Fit Exchange' 
  | 'Tailoring Adjustment' 
  | 'Store Credit' 
  | 'Refund to Original Payment';

export type ReturnStatus = 
  | 'Pending Review' 
  | 'Approved - Return Label Sent' 
  | 'Received at Warehouse' 
  | 'Inspection Complete' 
  | 'Completed / Refunded' 
  | 'Rejected';

export interface IReturnStatusHistory {
  previousStatus: string;
  newStatus: string;
  changedBy?: {
    id: string;
    name: string;
    role: string;
  };
  note?: string;
  timestamp: Date;
}

export interface IReturn extends Document {
  returnId: string; // e.g. RET-8842
  orderId: string; // e.g. PA-88210
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemNames: string[];
  actionType: ReturnActionType;
  reason: string;
  status: ReturnStatus;
  currentStep: number; // 1 to 5
  trackingReturnNumber?: string;
  replacementItem?: string;
  refundAmount?: number;
  adminNotes?: string;
  statusHistory: IReturnStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const ReturnStatusHistorySchema = new Schema<IReturnStatusHistory>({
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  changedBy: {
    id: { type: String },
    name: { type: String },
    role: { type: String }
  },
  note: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ReturnSchema = new Schema<IReturn>({
  returnId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  customerId: { type: String, index: true },
  customerName: { type: String, required: true, index: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  customerPhone: { type: String, trim: true },
  itemNames: [{ type: String }],
  actionType: { 
    type: String, 
    required: true, 
    enum: ['Size / Fit Exchange', 'Tailoring Adjustment', 'Store Credit', 'Refund to Original Payment'],
    default: 'Size / Fit Exchange'
  },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending Review', 'Approved - Return Label Sent', 'Received at Warehouse', 'Inspection Complete', 'Completed / Refunded', 'Rejected'],
    default: 'Pending Review',
    index: true 
  },
  currentStep: { type: Number, default: 1, min: 1, max: 5 },
  trackingReturnNumber: { type: String },
  replacementItem: { type: String },
  refundAmount: { type: Number, default: 0 },
  adminNotes: { type: String },
  statusHistory: [ReturnStatusHistorySchema]
}, {
  timestamps: true
});

ReturnSchema.index({ customerEmail: 1, createdAt: -1 });
ReturnSchema.index({ orderId: 1, createdAt: -1 });

export const ReturnModel = mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);
