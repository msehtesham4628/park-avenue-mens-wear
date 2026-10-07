import mongoose, { Schema, Document } from 'mongoose';

export type NotificationChannelType = 'email' | 'sms' | 'whatsapp' | 'in_app' | 'all';
export type NotificationDeliveryStatus = 'pending' | 'sent' | 'failed';
export type NotificationCategoryType = 'product' | 'news' | 'announcement' | 'promotion' | 'order' | 'alteration' | 'general';

export interface INotificationLog extends Document {
  notificationId: string;
  notificationType: string; // e.g. PRODUCT_ALERT, NEWS_DISPATCH, ANNOUNCEMENT, ORDER_SHIPPED, CUSTOM
  category: NotificationCategoryType;
  channel: NotificationChannelType;
  recipient: string;
  recipientName?: string;
  subject?: string;
  title?: string;
  message: string;
  status: NotificationDeliveryStatus;
  provider: string; // e.g. 'in_app', 'resend', 'twilio', 'meta-whatsapp', 'mock'
  providerMessageId?: string;
  errorMessage?: string;
  orderId?: string;
  alterationId?: string;
  customerId?: string;
  productId?: string;
  productName?: string;
  link?: string;
  priority?: 'standard' | 'high' | 'urgent';
  target?: 'all' | 'registered' | 'direct';
  readBy?: string[]; // Array of customerIds/emails who marked as read
  createdAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>({
  notificationId: { type: String, required: true, unique: true, index: true },
  notificationType: { type: String, required: true, index: true },
  category: { 
    type: String, 
    default: 'general',
    enum: ['product', 'news', 'announcement', 'promotion', 'order', 'alteration', 'general'],
    index: true 
  },
  channel: { 
    type: String, 
    required: true, 
    enum: ['email', 'sms', 'whatsapp', 'in_app', 'all'],
    index: true 
  },
  recipient: { type: String, required: true, index: true },
  recipientName: { type: String },
  subject: { type: String },
  title: { type: String },
  message: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'sent', 'failed'],
    default: 'sent',
    index: true 
  },
  provider: { type: String, default: 'in_app' },
  providerMessageId: { type: String },
  errorMessage: { type: String },
  orderId: { type: String, index: true },
  alterationId: { type: String, index: true },
  customerId: { type: String, index: true },
  productId: { type: String, index: true },
  productName: { type: String },
  link: { type: String },
  priority: { type: String, enum: ['standard', 'high', 'urgent'], default: 'standard' },
  target: { type: String, enum: ['all', 'registered', 'direct'], default: 'all', index: true },
  readBy: [{ type: String }]
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

NotificationLogSchema.index({ createdAt: -1 });
NotificationLogSchema.index({ target: 1, createdAt: -1 });

export const NotificationLogModel = 
  mongoose.models.NotificationLog || 
  mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
