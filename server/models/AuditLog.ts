import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  auditId: string;
  adminUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string; // e.g. PRODUCT_CREATED, INVENTORY_ADJUSTED, ORDER_STATUS_UPDATED
  entity: string; // e.g. Product, Order, Inventory, Alteration, Customer
  entityId: string;
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  auditId: { type: String, required: true, unique: true, index: true },
  adminUser: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true }
  },
  action: { type: String, required: true, index: true },
  entity: { type: String, required: true, index: true },
  entityId: { type: String, required: true, index: true },
  previousValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

AuditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
