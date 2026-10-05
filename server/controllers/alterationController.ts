import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { alterationService } from '../services/alterationService.js';
import { AlterationModel } from '../models/Alteration.js';

export const alterationController = {
  /**
   * POST /api/alterations
   */
  async createAlteration(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        orderId,
        productName,
        productSku,
        alterationType,
        measurements,
        tailorAssigned,
        expectedCompletionDate,
        notes,
        preferredNotificationChannel
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone || !productName || !alterationType) {
        return res.status(400).json({
          success: false,
          message: 'Client name, email, phone, product name, and alteration type are required.'
        });
      }

      const creator = req.user ? { id: req.user.id, name: req.user.name, role: req.user.role } : undefined;

      const alteration = await alterationService.createAlteration({
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        orderId,
        productName,
        productSku,
        alterationType,
        measurements,
        tailorAssigned,
        expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
        notes,
        preferredNotificationChannel
      }, creator);

      return res.status(201).json({
        success: true,
        data: alteration,
        message: 'Alteration commission registered successfully.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },


  /**
   * GET /api/alterations (authenticated customer/admin list)
   * Customers only receive their own alteration records.
   */
  async getAlterations(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { status, search, page, limit } = req.query;
      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 20;

      if (req.user.role === 'admin' || req.user.role === 'staff') {
        const result = await alterationService.getAlterations({
          status: status as string,
          search: search as string,
          page: pageNumber,
          limit: limitNumber
        });
        return res.status(200).json({ success: true, data: result.alterations, pagination: result.pagination });
      }

      const customer = await import('../models/Customer.js').then(m =>
        m.CustomerModel.findOne({
          $or: [
            { customerId: req.user!.customerId },
            { email: req.user!.email?.toLowerCase() }
          ]
        }).lean()
      );

      const alterations = await AlterationModel.find({
        $or: [
          ...(customer ? [{ customerId: customer.customerId }, { customerEmail: customer.email }] : []),
          { customerId: req.user!.customerId },
          { customerEmail: req.user!.email?.toLowerCase() }
        ]
      }).sort({ createdAt: -1 }).lean();

      return res.status(200).json({ success: true, data: alterations, pagination: { page: 1, limit: alterations.length, total: alterations.length, totalPages: 1 } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Unable to load alterations.' });
    }
  },

  /**
   * GET /api/alterations/:id
   */
  async getAlterationById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const alteration = await AlterationModel.findOne({
        $or: [
          { alterationId: id },
          { alterationId: id.toUpperCase() }
        ]
      }).lean();

      if (!alteration) {
        return res.status(404).json({ success: false, message: `Alteration ticket ${id} not found.` });
      }

      if (!req.user) {
        // Safe tracking view for direct lookup links
        const publicSafe = {
          alterationId: alteration.alterationId,
          id: alteration.alterationId,
          orderId: alteration.orderId,
          productName: alteration.productName,
          status: alteration.status,
          dateReceived: alteration.dateReceived,
          estimatedCompletion: alteration.estimatedCompletion,
          completedAt: alteration.completedAt,
          items: alteration.items || [],
          history: alteration.history || [],
          tailorAssigned: alteration.tailorAssigned
        };
        return res.status(200).json({ success: true, data: publicSafe, message: 'Alteration ticket retrieved.' });
      }

      if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        const ownsAlteration = alteration.customerId === req.user.customerId || alteration.customerEmail === req.user.email.toLowerCase();
        if (!ownsAlteration) {
          return res.status(403).json({ success: false, message: 'Access denied: this alteration does not belong to the authenticated customer.' });
        }
      }

      return res.status(200).json({
        success: true,
        data: alteration,
        message: 'Alteration ticket retrieved.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/alterations/lookup
   */
  async customerLookup(req: Request, res: Response) {
    try {
      const { alterationId, contact } = req.body;

      if (!alterationId || !contact) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both Alteration ID and Email or Phone number.'
        });
      }

      const alteration = await alterationService.customerLookup(alterationId, contact);

      if (!alteration) {
        return res.status(404).json({
          success: false,
          message: 'No matching alteration commission found.'
        });
      }

      const safeAlteration = {
        alterationId: alteration.alterationId,
        customerName: alteration.customerName,
        productName: alteration.productName,
        alterationType: alteration.alterationType,
        currentStatus: alteration.currentStatus,
        expectedCompletionDate: alteration.expectedCompletionDate,
        actualCompletionDate: alteration.actualCompletionDate,
        tailorAssigned: alteration.tailorAssigned,
        pickupCode: alteration.pickupCode,
        statusHistory: alteration.statusHistory,
        createdAt: alteration.createdAt
      };

      return res.status(200).json({
        success: true,
        data: safeAlteration,
        message: 'Alteration tracking status retrieved.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/alterations
   */
  async getAdminAlterations(req: Request, res: Response) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await alterationService.getAlterations({
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20
      });

      return res.status(200).json({
        success: true,
        data: result.alterations,
        pagination: result.pagination,
        message: 'Alterations loaded successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * PUT /api/admin/alterations/:id/status
   */
  async updateStatus(req: AuthenticatedRequest, res: Response) {
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

      const { id } = req.params;
      const { status, note, expectedCompletionDate, tailorAssigned, customNotificationMessage, notificationChannel } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
      }

      const alteration = await alterationService.updateStatus(
        id,
        status,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        {
          note,
          expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
          tailorAssigned,
          customNotificationMessage,
          notificationChannel
        }
      );

      return res.status(200).json({
        success: true,
        data: alteration,
        message: `Alteration status updated to ${status}. Notification recorded; delivery depends on the configured notification provider.`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
