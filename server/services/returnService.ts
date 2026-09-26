import mongoose from 'mongoose';
import { ReturnModel, IReturn, ReturnStatus, ReturnActionType } from '../models/Return.js';
import { OrderModel } from '../models/Order.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';

export interface CreateReturnInput {
  orderId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  itemNames?: string[];
  actionType: ReturnActionType;
  reason: string;
  preferredReplacement?: string;
}

export const returnService = {
  /**
   * Generate human-readable Return ID in format RET-XXXX
   */
  async generateReturnId(): Promise<string> {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    let returnId = `RET-${randomNum}`;
    const exists = await ReturnModel.findOne({ returnId });
    if (exists) {
      returnId = `RET-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    return returnId;
  },

  /**
   * Create a new Return / Exchange request
   */
  async createReturn(input: CreateReturnInput, creatorUser?: { id: string; name: string; role: string }): Promise<IReturn> {
    const cleanOrderId = input.orderId.trim().toUpperCase();
    
    // Look up associated order to autofill customer info if missing
    const order = await OrderModel.findOne({
      $or: [
        { orderId: cleanOrderId },
        { orderId: { $regex: cleanOrderId, $options: 'i' } }
      ]
    }).lean();

    const customerName = input.customerName || order?.customerName || 'Park Avenue Patron';
    const customerEmail = (input.customerEmail || order?.customerEmail || '').toLowerCase().trim();
    const customerPhone = input.customerPhone || order?.customerPhone || '';
    const customerId = input.customerId || order?.customerId;

    let items = input.itemNames && input.itemNames.length > 0 ? input.itemNames : [];
    if (items.length === 0 && order?.items && order.items.length > 0) {
      items = order.items.map(i => `${i.name} (${i.size}, ${i.color})`);
    }
    if (items.length === 0) {
      items = ['Sartorial Garment'];
    }

    const returnId = await this.generateReturnId();
    const trackingReturnNumber = `FEDEX-RET-${Math.floor(100000 + Math.random() * 900000)}`;

    const initialStatus: ReturnStatus = 'Approved - Return Label Sent';
    const initialStep = 2; // Request accepted and prepaid return label issued immediately for luxury service

    const returnDoc = new ReturnModel({
      returnId,
      orderId: cleanOrderId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      itemNames: items,
      actionType: input.actionType || 'Size / Fit Exchange',
      reason: input.reason,
      status: initialStatus,
      currentStep: initialStep,
      trackingReturnNumber,
      replacementItem: input.preferredReplacement || (input.actionType === 'Size / Fit Exchange' ? 'Direct Size / Fit Replacement' : undefined),
      refundAmount: order?.total || 0,
      adminNotes: 'Automated return authorization initiated. Prepaid return courier label generated.',
      statusHistory: [{
        previousStatus: 'None',
        newStatus: initialStatus,
        changedBy: creatorUser ? {
          id: creatorUser.id,
          name: creatorUser.name,
          role: creatorUser.role
        } : {
          id: customerId || 'patron',
          name: customerName,
          role: 'customer'
        },
        note: `Return/Exchange request created: ${input.reason}`,
        timestamp: new Date()
      }]
    });

    await returnDoc.save();

    // Log notification
    try {
      await notificationService.createLog({
        recipient: {
          customerId: customerId || 'guest',
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        channel: 'email',
        template: 'order_status_update',
        subject: `Park Avenue Mens Wear: Return Request #${returnId} Authorized`,
        content: `Your return/exchange request for Order #${cleanOrderId} has been authorized. Prepaid shipping label: ${trackingReturnNumber}.`,
        status: 'delivered',
        metadata: { returnId, orderId: cleanOrderId, actionType: input.actionType }
      });
    } catch (_) {}

    // Audit log
    try {
      await auditService.logAction({
        action: 'create',
        entity: 'return',
        entityId: returnId,
        performedBy: {
          id: creatorUser?.id || customerId || 'patron',
          name: creatorUser?.name || customerName,
          role: creatorUser?.role || 'customer'
        },
        details: { orderId: cleanOrderId, actionType: input.actionType, returnId }
      });
    } catch (_) {}

    return returnDoc;
  },

  /**
   * Get all returns with filters (Admin)
   */
  async getReturns(options: { status?: string; actionType?: string; search?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status && options.status !== 'all') {
      query.status = options.status;
    }
    if (options.actionType && options.actionType !== 'all') {
      query.actionType = options.actionType;
    }
    if (options.search) {
      const s = options.search.trim();
      query.$or = [
        { returnId: { $regex: s, $options: 'i' } },
        { orderId: { $regex: s, $options: 'i' } },
        { customerName: { $regex: s, $options: 'i' } },
        { customerEmail: { $regex: s, $options: 'i' } },
        { trackingReturnNumber: { $regex: s, $options: 'i' } }
      ];
    }

    const [returns, total] = await Promise.all([
      ReturnModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReturnModel.countDocuments(query)
    ]);

    return {
      returns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get returns for a specific customer
   */
  async getCustomerReturns(customerId?: string, email?: string): Promise<IReturn[]> {
    const conditions: any[] = [];
    if (customerId) conditions.push({ customerId });
    if (email) conditions.push({ customerEmail: email.toLowerCase().trim() });

    if (conditions.length === 0) return [];

    return ReturnModel.find({ $or: conditions }).sort({ createdAt: -1 }).lean();
  },

  /**
   * Get return by Return ID or Order ID
   */
  async getReturnById(queryStr: string): Promise<IReturn | null> {
    const clean = queryStr.trim().toUpperCase();
    if (!clean) return null;

    return ReturnModel.findOne({
      $or: [
        { returnId: clean },
        { returnId: { $regex: clean, $options: 'i' } },
        { orderId: clean },
        { trackingReturnNumber: clean }
      ]
    }).lean();
  },

  /**
   * Update return status, step, label, or notes (Admin)
   */
  async updateReturnStatus(
    id: string,
    updateData: {
      status?: ReturnStatus;
      currentStep?: number;
      trackingReturnNumber?: string;
      replacementItem?: string;
      refundAmount?: number;
      adminNotes?: string;
    },
    adminUser?: { id: string; name: string; role: string }
  ): Promise<IReturn | null> {
    const isObjectId = mongoose.isValidObjectId(id);
    const ret = await ReturnModel.findOne({
      $or: [
        { returnId: id.toUpperCase() },
        { returnId: id },
        ...(isObjectId ? [{ _id: id }] : [])
      ]
    });

    if (!ret) return null;

    const prevStatus = ret.status;
    if (updateData.status && updateData.status !== ret.status) {
      ret.status = updateData.status;

      // Automatically sync step with status
      if (!updateData.currentStep) {
        if (updateData.status === 'Pending Review') ret.currentStep = 1;
        else if (updateData.status === 'Approved - Return Label Sent') ret.currentStep = 2;
        else if (updateData.status === 'Received at Warehouse') ret.currentStep = 3;
        else if (updateData.status === 'Inspection Complete') ret.currentStep = 4;
        else if (updateData.status === 'Completed / Refunded') ret.currentStep = 5;
      }

      ret.statusHistory.push({
        previousStatus: prevStatus,
        newStatus: updateData.status,
        changedBy: adminUser ? {
          id: adminUser.id,
          name: adminUser.name,
          role: adminUser.role
        } : undefined,
        note: updateData.adminNotes || `Return status transitioned from ${prevStatus} to ${updateData.status}`,
        timestamp: new Date()
      });
    }

    if (updateData.currentStep !== undefined) ret.currentStep = updateData.currentStep;
    if (updateData.trackingReturnNumber) ret.trackingReturnNumber = updateData.trackingReturnNumber;
    if (updateData.replacementItem) ret.replacementItem = updateData.replacementItem;
    if (updateData.refundAmount !== undefined) ret.refundAmount = updateData.refundAmount;
    if (updateData.adminNotes) ret.adminNotes = updateData.adminNotes;

    await ret.save();

    // Send customer notification if status changed
    if (updateData.status && updateData.status !== prevStatus) {
      try {
        await notificationService.createLog({
          recipient: {
            customerId: ret.customerId || 'guest',
            name: ret.customerName,
            email: ret.customerEmail,
            phone: ret.customerPhone
          },
          channel: 'email',
          template: 'order_status_update',
          subject: `Park Avenue Update: Return #${ret.returnId} Status Changed to ${ret.status}`,
          content: `Your return/exchange for Order #${ret.orderId} is now: ${ret.status}. ${ret.adminNotes || ''}`,
          status: 'delivered',
          metadata: { returnId: ret.returnId, orderId: ret.orderId, newStatus: ret.status }
        });
      } catch (_) {}
    }

    return ret;
  }
};
