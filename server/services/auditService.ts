import { AuditLogModel, IAuditLog } from '../models/AuditLog.js';

export interface RecordAuditParams {
  adminUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    staffTitle?: string;
    department?: string;
  };
  action: string;
  entity: string;
  entityId: string;
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface GetLogsOptions {
  entity?: string;
  entityId?: string;
  action?: string;
  role?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}

export const auditService = {
  async record(params: RecordAuditParams): Promise<IAuditLog> {
    const auditId = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const log = new AuditLogModel({
      auditId,
      ...params
    });

    try {
      await log.save();
    } catch (err: any) {
      console.warn(`[AuditLog] Warning: unable to persist audit log to MongoDB (${err.message}). Logging to stdout:`, {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        user: params.adminUser.email
      });
    }

    return log;
  },

  async getLogs(options: GetLogsOptions = {}) {
    const query: any = {};

    if (options.entity && options.entity !== 'all') {
      query.entity = options.entity;
    }

    if (options.entityId) {
      query.entityId = options.entityId;
    }

    if (options.action && options.action !== 'all') {
      query.action = { $regex: options.action, $options: 'i' };
    }

    if (options.role && options.role !== 'all') {
      query['adminUser.role'] = options.role.toLowerCase();
    }

    if (options.userId && options.userId !== 'all') {
      query.$or = [
        { 'adminUser.id': options.userId },
        { 'adminUser.email': options.userId.toLowerCase() }
      ];
    }

    if (options.search && options.search.trim()) {
      const s = options.search.trim();
      const regex = { $regex: s, $options: 'i' };
      query.$or = [
        { action: regex },
        { entityId: regex },
        { entity: regex },
        { 'adminUser.name': regex },
        { 'adminUser.email': regex },
        { 'adminUser.id': regex },
        { 'metadata.notes': regex },
        { 'newValue.notes': regex }
      ];
    }

    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        query.createdAt.$gte = new Date(options.startDate);
      }
      if (options.endDate) {
        const end = new Date(options.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const limit = Math.min(200, Math.max(1, options.limit || 50));
    const skip = Math.max(0, options.skip || 0);

    try {
      const logs = await AuditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
      const total = await AuditLogModel.countDocuments(query);
      return { logs, total };
    } catch {
      return { logs: [], total: 0 };
    }
  }
};
