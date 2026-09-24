import mongoose, { Schema, Document } from 'mongoose';

export type NotificationChannelType = 'email' | 'sms' | 'whatsapp';
export type NotificationDeliveryStatus = 'pending' | 'sent' | 'failed';

export interface INotificationLog extends Document {
  notificationId: string;
  notificationType: string; // e.g. ORDER_CONFIRMED, ORDER_SHIPPED, ALTERATION_READY, CUSTOM
  channel: NotificationChannelType;
  recipient: string;
  recipientName?: string;
  subject?: string;
  message: string;
  status: NotificationDeliveryStatus;
  provider: string; // e.g. 'resend', 'twilio', 'meta-whatsapp', 'mock'
  providerMessageId?: string;
  errorMessage?: string;
  orderId?: string;
  alterationId?: string;
  customerId?: string;
  createdAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>({
  notificationId: { type: String, required: true, unique: true, index: true },
  notificationType: { type: String, required: true, index: true },
  channel: { 
    type: String, 
    required: true, 
    enum: ['email', 'sms', 'whatsapp'],
    index: true 
  },
  recipient: { type: String, required: true, index: true },
  recipientName: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
    index: true 
  },
  provider: { type: String, default: 'adapter' },
  providerMessageId: { type: String },
  errorMessage: { type: String },
  orderId: { type: String, index: true },
  alterationId: { type: String, index: true },
  customerId: { type: String, index: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

NotificationLogSchema.index({ createdAt: -1 });

export const NotificationLogModel = 
  mongoose.models.NotificationLog || 
  mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
