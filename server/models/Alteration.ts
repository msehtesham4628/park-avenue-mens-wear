import mongoose, { Schema, Document } from 'mongoose';

export type AlterationStatus = 
  | 'Received'
  | 'Review'
  | 'In Progress'
  | 'Quality Check'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled';

export interface IAlterationStatusHistory {
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

export interface IAlterationMeasurements {
  trouserHemType?: string;
  trouserInseam?: string;
  trouserWaistAdjustment?: string;
  jacketSleeveAdjustment?: string;
  jacketWaistSuppression?: string;
  jacketCollarAdjustment?: string;
  shirtSleeveShorten?: string;
  notes?: string;
}

export interface IAlteration extends Document {
  alterationId: string; // e.g. ALT-2026-000001
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId?: string;
  productName: string;
  productSku?: string;
  alterationType: string;
  measurements: IAlterationMeasurements;
  tailorAssigned: string;
  currentStatus: AlterationStatus;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  statusHistory: IAlterationStatusHistory[];
  notes?: string;
  pickupCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlterationStatusHistorySchema = new Schema<IAlterationStatusHistory>({
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

const AlterationSchema = new Schema<IAlteration>({
  alterationId: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, index: true },
  customerName: { type: String, required: true, index: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  customerPhone: { type: String, required: true, trim: true, index: true },
  orderId: { type: String, index: true },
  productName: { type: String, required: true },
  productSku: { type: String },
  alterationType: { type: String, required: true },
  measurements: {
    trouserHemType: { type: String },
    trouserInseam: { type: String },
    trouserWaistAdjustment: { type: String },
    jacketSleeveAdjustment: { type: String },
    jacketWaistSuppression: { type: String },
    jacketCollarAdjustment: { type: String },
    shirtSleeveShorten: { type: String },
    notes: { type: String }
  },
  tailorAssigned: { type: String, default: 'Master Tailor Giovanni' },
  currentStatus: { 
    type: String, 
    required: true,
    enum: ['Received', 'Review', 'In Progress', 'Quality Check', 'Ready for Pickup', 'Completed', 'Cancelled'],
    default: 'Received',
    index: true 
  },
  expectedCompletionDate: { type: Date },
  actualCompletionDate: { type: Date },
  statusHistory: [AlterationStatusHistorySchema],
  notes: { type: String },
  pickupCode: { type: String }
}, {
  timestamps: true
});

AlterationSchema.index({ customerEmail: 1, alterationId: 1 });
AlterationSchema.index({ customerPhone: 1, alterationId: 1 });
AlterationSchema.index({ createdAt: -1 });

export const AlterationModel = mongoose.models.Alteration || mongoose.model<IAlteration>('Alteration', AlterationSchema);
