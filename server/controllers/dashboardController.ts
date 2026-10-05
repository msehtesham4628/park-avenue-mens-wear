import { Request, Response } from 'express';
import { ProductModel } from '../models/Product.js';
import { OrderModel } from '../models/Order.js';
import { CustomerModel } from '../models/Customer.js';
import { AlterationModel } from '../models/Alteration.js';
import { ReturnModel } from '../models/Return.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { auditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const dashboardController = {
  /**
   * GET /api/admin/dashboard/stats
   */
  async getDashboardStats(_req: Request, res: Response) {
    try {
      const [
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        totalCustomers,
        pendingAlterations,
        lowStockItems,
        outOfStockItems,
        totalReturns,
        pendingReturns,
        activeReturns,
        completedReturns,
        totalAuditLogs
      ] = await Promise.all([
        ProductModel.countDocuments(),
        ProductModel.find({ isActive: true }).select('stockQuantity variants lowStockThreshold').lean(),
        OrderModel.countDocuments(),
        OrderModel.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] } }),
        OrderModel.countDocuments({ orderStatus: { $in: ['Shipped', 'Out for Delivery'] } }),
        OrderModel.countDocuments({ orderStatus: 'Delivered' }),
        CustomerModel.countDocuments({ role: 'customer' }),
        AlterationModel.countDocuments({ currentStatus: { $nin: ['Completed', 'Cancelled'] } }),
        ProductModel.countDocuments({
          isActive: true,
          $expr: { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', '$lowStockThreshold'] }] }
        }),
        ProductModel.countDocuments({ isActive: true, stockQuantity: { $lte: 0 } }),
        ReturnModel.countDocuments(),
        ReturnModel.countDocuments({ status: 'Pending Review' }),
        ReturnModel.countDocuments({ status: { $in: ['Approved - Return Label Sent', 'Received at Warehouse', 'Inspection Complete'] } }),
        ReturnModel.countDocuments({ status: 'Completed / Refunded' }),
        AuditLogModel.countDocuments()
      ]);

      const totalInventory = activeProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);

      // Financial metric
      const orders = await OrderModel.find().select('total orderStatus').lean();
      const grossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalInventory,
          lowStockCount: lowStockItems,
          outOfStockCount: outOfStockItems,
          totalOrders,
          pendingOrders,
          shippedOrders,
          deliveredOrders,
          totalCustomers,
          pendingAlterations,
          totalReturns,
          pendingReturns,
          activeReturns,
          completedReturns,
          grossRevenue,
          totalAuditLogs
        },
        message: 'Dashboard metrics calculated.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/dashboard/logs
   * Retrieve paginated and filtered Admin and Staff audit logs
   */
  async getAuditLogs(req: Request, res: Response) {
    try {
      const { search, role, entity, action, userId, limit = 50, page = 1 } = req.query;
      const query: any = {};

      if (role && role !== 'all') {
        query['adminUser.role'] = String(role).toLowerCase();
      }

      if (entity && entity !== 'all') {
        query.entity = String(entity);
      }

      if (action && action !== 'all') {
        query.action = String(action);
      }

      if (userId && userId !== 'all') {
        const u = String(userId);
        query.$or = [
          { 'adminUser.id': u },
          { 'adminUser.email': u.toLowerCase() }
        ];
      }

      if (search && String(search).trim()) {
        const term = String(search).trim();
        query.$or = [
          { action: { $regex: term, $options: 'i' } },
          { entity: { $regex: term, $options: 'i' } },
          { entityId: { $regex: term, $options: 'i' } },
          { 'adminUser.name': { $regex: term, $options: 'i' } },
          { 'adminUser.email': { $regex: term, $options: 'i' } },
          { 'adminUser.role': { $regex: term, $options: 'i' } },
          { 'metadata.notes': { $regex: term, $options: 'i' } }
        ];
      }

      const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const skip = (pageNum - 1) * limitNum;

      const [logs, total] = await Promise.all([
        AuditLogModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        AuditLogModel.countDocuments(query)
      ]);

      const formatted = logs.map(l => ({
        id: l._id?.toString() || l.auditId,
        auditId: l.auditId,
        adminUser: {
          id: l.adminUser?.id || 'system',
          name: l.adminUser?.name || 'Administrator',
          email: l.adminUser?.email || 'admin@parkavenuemenswear.com',
          role: l.adminUser?.role || 'admin',
          staffTitle: l.adminUser?.staffTitle || (l.adminUser?.role === 'admin' ? 'Executive Administrator' : 'Staff Tailor'),
          department: l.adminUser?.department || (l.adminUser?.role === 'admin' ? 'Executive' : 'Atelier')
        },
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        previousValue: l.previousValue,
        newValue: l.newValue,
        metadata: l.metadata,
        notes: l.metadata?.notes || (typeof l.newValue === 'object' && l.newValue?.notes ? l.newValue.notes : undefined),
        ipAddress: l.ipAddress || '127.0.0.1 (Internal Atelier)',
        userAgent: l.userAgent || 'Atelier Staff Terminal',
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString()
      }));

      return res.status(200).json({
        success: true,
        data: formatted,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        },
        message: 'Audit logs retrieved.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/admin/dashboard/logs
   * Manually record a staff handover, inspection check, or operational log note
   */
  async createAuditLog(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user || {
        id: 'CUST-ADMIN-001',
        name: 'Park Avenue Executive Admin',
        email: 'admin@parkavenuemenswear.com',
        role: 'admin'
      };

      const { action, entity, entityId, previousValue, newValue, notes, metadata } = req.body;

      if (!action || !entity) {
        return res.status(400).json({
          success: false,
          message: 'action and entity are required fields.'
        });
      }

      const log = await auditService.record({
        adminUser: {
          id: user.id || 'STAFF',
          name: user.name || 'Staff Member',
          email: user.email || 'staff@parkavenuemenswear.com',
          role: user.role || 'staff'
        },
        action: String(action).toUpperCase(),
        entity: String(entity),
        entityId: entityId || `REF-${Date.now().toString(36).toUpperCase()}`,
        previousValue,
        newValue: newValue || (notes ? { notes } : undefined),
        metadata: { ...(metadata || {}), notes },
        ipAddress: req.ip || '127.0.0.1',
        userAgent: (req.headers['user-agent'] as string) || 'Atelier Staff Workstation'
      });

      return res.status(201).json({
        success: true,
        data: log,
        message: 'Staff audit log registered successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

