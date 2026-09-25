import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { customerService } from '../services/customerService.js';

export const customerController = {
  /**
   * GET /api/admin/customers
   */
  async getCustomers(req: Request, res: Response) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await customerService.getCustomers({
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20
      });

      return res.status(200).json({
        success: true,
        data: result.customers,
        pagination: result.pagination,
        message: 'Customers retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/customers/search
   */
  async searchCustomers(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ success: false, message: 'Search parameter "q" is required.' });
      }

      const results = await customerService.searchCustomers(q);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length,
        message: 'Customer search results.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/customers/:id
   */
  async getCustomerProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await customerService.getCustomerProfile(id);

      if (!profile) {
        return res.status(404).json({ success: false, message: 'Customer profile not found.' });
      }

      const customerData: any = {
        ...profile.customer,
        id: profile.customer.customerId || (profile.customer as any)._id,
        orders: profile.orders,
        alterations: profile.alterations
      };
      delete customerData.passwordHash;

      return res.status(200).json({
        success: true,
        data: customerData,
        message: 'Customer profile loaded.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * PUT /api/admin/customers/:id
   */
  async updateCustomer(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user || { id: 'ADMIN', name: 'Admin', email: 'admin@parkavenuemenswear.com', role: 'admin' };
      const { id } = req.params;

      const updated = await customerService.updateCustomer(id, req.body, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Customer information updated.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
