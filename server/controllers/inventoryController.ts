import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { inventoryService } from '../services/inventoryService.js';

export const inventoryController = {
  /**
   * GET /api/admin/inventory
   */
  async getOverview(req: Request, res: Response) {
    try {
      const { search, category, status, page, limit } = req.query;
      const result = await inventoryService.getInventoryOverview({
        search: search as string,
        category: category as string,
        status: status as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 25
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        message: 'Inventory overview loaded.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/admin/inventory/adjust
   */
  async adjustStock(req: AuthenticatedRequest, res: Response) {
    try {
      const operator = req.body?.operator;
      const user = operator ? {
        id: operator.id || operator.customerId || 'STAFF',
        name: operator.name || 'Staff Member',
        email: operator.email || 'staff@parkavenuemenswear.com',
        role: operator.role || 'staff',
        staffTitle: operator.staffTitle,
        department: operator.department
      } : (req.user || { id: 'ADMIN', name: 'Admin', email: 'admin@parkavenuemenswear.com', role: 'admin' });

      const { productId, variantId, size, color, adjustmentType, quantity, reason, notes } = req.body;

      if (!productId || !adjustmentType || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'productId, adjustmentType (add|remove|set), and quantity are required.'
        });
      }

      const result = await inventoryService.adjustStock({
        productId,
        variantId,
        size,
        color,
        adjustmentType,
        quantity: parseInt(quantity, 10),
        reason: reason || 'manual_adjustment',
        notes,
        adminUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          staffTitle: user.staffTitle,
          department: user.department
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          product: result.product,
          transaction: result.transaction,
          updatedVariant: result.updatedVariant
        },
        message: 'Inventory adjusted successfully.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/inventory/low-stock
   */
  async getLowStock(_req: Request, res: Response) {
    try {
      const items = await inventoryService.getLowStockProducts();
      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
        message: 'Low-stock items retrieved.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/inventory/out-of-stock
   */
  async getOutOfStock(_req: Request, res: Response) {
    try {
      const items = await inventoryService.getOutOfStockProducts();
      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
        message: 'Out-of-stock items retrieved.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/inventory/history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const { productId, sku, reason, page, limit } = req.query;
      const result = await inventoryService.getInventoryHistory({
        productId: productId as string,
        sku: sku as string,
        reason: reason as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50
      });

      return res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
        message: 'Inventory history loaded.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
