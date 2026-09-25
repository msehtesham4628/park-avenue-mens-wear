import mongoose from 'mongoose';
import { AlterationModel, IAlteration, AlterationStatus, IAlterationMeasurements } from '../models/Alteration.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';

export interface CreateAlterationInput {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId?: string;
  productName: string;
  productSku?: string;
  alterationType: string;
  measurements?: IAlterationMeasurements;
  tailorAssigned?: string;
  expectedCompletionDate?: Date;
  notes?: string;
  preferredNotificationChannel?: 'email' | 'sms' | 'whatsapp';
}

export const alterationService = {
  /**
   * Generate human-readable alteration ID in format ALT-YYYY-XXXXXX
   */
  async generateAlterationId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await AlterationModel.countDocuments();
    const sequence = (count + 1).toString().padStart(6, '0');
    let alterationId = `ALT-${year}-${sequence}`;

    const exists = await AlterationModel.findOne({ alterationId });
    if (exists) {
      alterationId = `ALT-${year}-${(count + Math.floor(Math.random() * 1000) + 1).toString().padStart(6, '0')}`;
    }
    return alterationId;
  },

  /**
   * Create new alteration ticket
   */
  async createAlteration(input: CreateAlterationInput, creatorUser?: { id: string; name: string; role: string }): Promise<IAlteration> {
    const alterationId = await this.generateAlterationId();
    const pickupCode = `PA-FIT-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus: AlterationStatus = 'Received';
    const statusHistory = [{
      previousStatus: 'None',
      newStatus: initialStatus,
      changedBy: {
        id: creatorUser?.id || 'CLIENT',
        name: creatorUser?.name || input.customerName,
        role: creatorUser?.role || 'customer'
      },
      note: 'Garment alteration ticket registered at atelier.',
      timestamp: new Date()
    }];

    const alteration = new AlterationModel({
      alterationId,
      customerId: input.customerId,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.toLowerCase().trim(),
      customerPhone: input.customerPhone.trim(),
      orderId: input.orderId,
      productName: input.productName,
      productSku: input.productSku,
      alterationType: input.alterationType,
      measurements: input.measurements || {},
      tailorAssigned: input.tailorAssigned || 'Master Tailor Giovanni Rossi',
      currentStatus: initialStatus,
      expectedCompletionDate: input.expectedCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days standard
      statusHistory,
      notes: input.notes,
      pickupCode
    });

    await alteration.save();

    // Trigger ALTERATION_RECEIVED notification
    const channel = input.preferredNotificationChannel || 'email';
    const recipient = channel === 'email' ? alteration.customerEmail : alteration.customerPhone;

    try {
      await notificationService.dispatchEvent(
        'ALTERATION_RECEIVED',
        channel,
        recipient,
        {
          alterationId: alteration.alterationId,
          customerId: alteration.customerId,
          productName: alteration.productName,
          tailorAssigned: alteration.tailorAssigned
        },
        undefined,
        alteration.customerName
      );
    } catch (notifErr: any) {
      console.warn(`[AlterationService] Notification warning: ${notifErr.message}`);
    }

    await auditService.record({
      adminUser: { id: creatorUser?.id || 'CLIENT', name: creatorUser?.name || input.customerName, email: input.customerEmail, role: creatorUser?.role || 'customer' },
      action: 'ALTERATION_CREATED',
      entity: 'Alteration',
      entityId: alteration.alterationId,
      newValue: { type: alteration.alterationType, garment: alteration.productName }
    });

    return alteration;
  },

  /**
   * Update alteration status with history and notification dispatch
   */
  async updateStatus(
    alterationId: string,
    newStatus: string,
    adminUser: { id: string; name: string; email: string; role: string },
    options: {
      note?: string;
      expectedCompletionDate?: Date;
      tailorAssigned?: string;
      customNotificationMessage?: string;
      notificationChannel?: 'email' | 'sms' | 'whatsapp';
    } = {}
  ): Promise<IAlteration> {
    const isObjectId = mongoose.isValidObjectId(alterationId);
    const alteration = await AlterationModel.findOne({
      $or: [
        { alterationId },
        { alterationId: { $regex: new RegExp(`^${alterationId.trim()}$`, 'i') } },
        ...(isObjectId ? [{ _id: alterationId }] : [])
      ]
    });
    if (!alteration) {
      throw new Error(`Alteration ticket ${alterationId} not found.`);
    }

    const statusNormalizeMap: Record<string, AlterationStatus> = {
      'alteration received': 'Received',
      'received': 'Received',
      'measurement/review': 'Review',
      'review': 'Review',
      'alteration in progress': 'In Progress',
      'in progress': 'In Progress',
      'in_progress': 'In Progress',
      'quality check': 'Quality Check',
      'quality_check': 'Quality Check',
      'ready for pickup': 'Ready for Pickup',
      'ready_for_pickup': 'Ready for Pickup',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'canceled': 'Cancelled'
    };
    const resolvedStatus = statusNormalizeMap[String(newStatus).toLowerCase().trim()] || (newStatus as AlterationStatus);

    const previousStatus = alteration.currentStatus;
    alteration.currentStatus = resolvedStatus;

    if (options.expectedCompletionDate) {
      alteration.expectedCompletionDate = options.expectedCompletionDate;
    }
    if (options.tailorAssigned) {
      alteration.tailorAssigned = options.tailorAssigned;
    }
    if (resolvedStatus === 'Completed') {
      alteration.actualCompletionDate = new Date();
    }

    alteration.statusHistory.push({
      previousStatus,
      newStatus,
      changedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      note: options.note || `Alteration transitioned to ${newStatus}`,
      timestamp: new Date()
    });

    await alteration.save();

    // Trigger Notification Event
    const eventTypeMap: Record<string, string> = {
      'In Progress': 'ALTERATION_IN_PROGRESS',
      'Ready for Pickup': 'ALTERATION_READY',
      'Completed': 'ALTERATION_COMPLETED'
    };

    const eventType = eventTypeMap[newStatus];
    if (eventType) {
      const channel = options.notificationChannel || 'email';
      const recipient = channel === 'email' ? alteration.customerEmail : alteration.customerPhone;

      try {
        await notificationService.dispatchEvent(
          eventType,
          channel,
          recipient,
          {
            alterationId: alteration.alterationId,
            productName: alteration.productName,
            pickupCode: alteration.pickupCode
          },
          options.customNotificationMessage,
          alteration.customerName
        );
      } catch (err: any) {
        console.warn(`[AlterationService] Status notification error: ${err.message}`);
      }
    }

    await auditService.record({
      adminUser,
      action: 'ALTERATION_STATUS_CHANGED',
      entity: 'Alteration',
      entityId: alteration.alterationId,
      previousValue: { status: previousStatus },
      newValue: { status: newStatus }
    });

    return alteration;
  },

  /**
   * Customer alteration lookup
   */
  async customerLookup(alterationId: string, contact: string): Promise<IAlteration | null> {
    const cleanId = alterationId.trim();
    const cleanContact = contact.trim().toLowerCase();
    const phoneDigits = cleanContact.replace(/\D/g, '');

    const contactOr: any[] = [{ customerEmail: cleanContact }];
    if (phoneDigits.length >= 7) {
      contactOr.push({ customerPhone: { $regex: phoneDigits } });
    }

    return AlterationModel.findOne({
      alterationId: { $regex: new RegExp(`^${cleanId}$`, 'i') },
      $or: contactOr
    }).lean();
  },

  /**
   * Admin list alterations
   */
  async getAlterations(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status && options.status !== 'All') {
      query.currentStatus = options.status;
    }

    if (options.search) {
      const s = options.search.trim();
      query.$or = [
        { alterationId: { $regex: s, $options: 'i' } },
        { customerName: { $regex: s, $options: 'i' } },
        { customerEmail: { $regex: s, $options: 'i' } },
        { customerPhone: { $regex: s, $options: 'i' } },
        { productName: { $regex: s, $options: 'i' } }
      ];
    }

    const [alterations, total] = await Promise.all([
      AlterationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AlterationModel.countDocuments(query)
    ]);

    return {
      alterations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};
