import { AuditLogModel, IAuditLog } from '../models/AuditLog.js';

export interface RecordAuditParams {
  adminUser: {
    id: string;
    name: string;
    email: string;
    role: string;
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

  async getLogs(options: { entity?: string; entityId?: string; limit?: number; skip?: number } = {}) {
    const query: any = {};
    if (options.entity) query.entity = options.entity;
    if (options.entityId) query.entityId = options.entityId;

    const limit = options.limit || 50;
    const skip = options.skip || 0;

    try {
      const logs = await AuditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
      const total = await AuditLogModel.countDocuments(query);
      return { logs, total };
    } catch {
      return { logs: [], total: 0 };
    }
  }
};
