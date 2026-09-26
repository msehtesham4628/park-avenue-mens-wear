import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { returnService } from '../services/returnService.js';

export const returnController = {
  /**
   * POST /api/returns
   * Create new return or exchange request
   */
  async createReturn(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        orderId,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        itemNames,
        actionType,
        reason,
        preferredReplacement
      } = req.body;

      if (!orderId || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and reason are required to submit a return or exchange.'
        });
      }

      const creator = req.user ? { id: req.user.id, name: req.user.name, role: req.user.role } : undefined;

      const newReturn = await returnService.createReturn({
        orderId,
        customerId: customerId || req.user?.customerId,
        customerName: customerName || req.user?.name,
        customerEmail: customerEmail || req.user?.email,
        customerPhone: customerPhone || req.user?.phone,
        itemNames: Array.isArray(itemNames) ? itemNames : (itemNames ? [itemNames] : []),
        actionType,
        reason,
        preferredReplacement
      }, creator);

      return res.status(201).json({
        success: true,
        data: newReturn,
        message: `Return claim #${newReturn.returnId} registered in database.`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to create return request.' });
    }
  },

  /**
   * GET /api/returns
   * Admin view for all returns with filtering & pagination
   */
  async getReturns(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, actionType, search, page, limit } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 50;

      const result = await returnService.getReturns({
        status: status as string,
        actionType: actionType as string,
        search: search as string,
        page: pageNumber,
        limit: limitNumber
      });

      return res.status(200).json({
        success: true,
        data: result.returns,
        pagination: result.pagination
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Unable to retrieve returns.' });
    }
  },

  /**
   * GET /api/returns/my-returns
   * Customer view for their own returns
   */
  async getMyReturns(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const returns = await returnService.getCustomerReturns(req.user.customerId, req.user.email);
      return res.status(200).json({
        success: true,
        data: returns
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Unable to retrieve your returns.' });
    }
  },

  /**
   * GET /api/returns/:id
   * Public lookup by Return ID or Order ID
   */
  async getReturnById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const found = await returnService.getReturnById(id);

      if (!found) {
        return res.status(404).json({
          success: false,
          message: `No return record found for "${id}".`
        });
      }

      return res.status(200).json({
        success: true,
        data: found
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error looking up return record.' });
    }
  },

  /**
   * PUT /api/returns/:id/status
   * Admin status, label, step, notes update
   */
  async updateReturnStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, currentStep, trackingReturnNumber, replacementItem, refundAmount, adminNotes } = req.body;

      const adminUser = req.user ? { id: req.user.id, name: req.user.name, role: req.user.role } : undefined;

      const updated = await returnService.updateReturnStatus(id, {
        status,
        currentStep,
        trackingReturnNumber,
        replacementItem,
        refundAmount,
        adminNotes
      }, adminUser);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Return record "${id}" not found.`
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Return claim #${updated.returnId} updated successfully.`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Error updating return record.' });
    }
  }
};
