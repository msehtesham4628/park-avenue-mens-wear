import { Request, Response } from 'express';
import { couponService } from '../services/couponService.js';

export const couponController = {
  /**
   * GET /api/coupons
   * List all coupons (for Admin Dashboard)
   */
  async getAll(req: Request, res: Response) {
    try {
      const coupons = await couponService.getAllCoupons();
      return res.status(200).json({
        success: true,
        data: coupons,
        count: coupons.length,
        message: 'Coupons retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve coupons.'
      });
    }
  },

  /**
   * GET /api/coupons/validate?code=...&subtotal=...
   * Validate coupon code for Cart & Checkout
   */
  async validate(req: Request, res: Response) {
    try {
      const code = (req.query.code as string) || '';
      const subtotal = req.query.subtotal ? parseFloat(req.query.subtotal as string) : 0;

      const result = await couponService.validateCoupon(code, subtotal);
      if (!result.valid) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: result.message,
          discountAmount: 0
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        data: result.coupon,
        discountAmount: result.discountAmount,
        message: result.message
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        valid: false,
        message: err.message || 'Failed to validate coupon.'
      });
    }
  },

  /**
   * POST /api/coupons
   * Create a new coupon (Admin Dashboard)
   */
  async create(req: Request, res: Response) {
    try {
      const { 
        code, 
        discountType, 
        discountValue, 
        minOrderAmount, 
        maxDiscountAmount, 
        expiresAt, 
        usageLimit, 
        description,
        isActive 
      } = req.body;

      if (!code || !code.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code is required.'
        });
      }

      if (discountValue === undefined || discountValue === null || Number(discountValue) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'A valid discount value greater than 0 is required.'
        });
      }

      const created = await couponService.createCoupon({
        code,
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        expiresAt: expiresAt || null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        description,
        isActive: isActive !== false,
        createdBy: (req as any).user?.username || (req as any).user?.email || 'Atelier Administrator'
      });

      return res.status(201).json({
        success: true,
        data: created,
        message: `Coupon "${created.code}" created successfully.`
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to create coupon.'
      });
    }
  },

  /**
   * DELETE /api/coupons/:id
   * Delete a coupon by ID or code (Admin Dashboard)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Coupon ID or code is required.'
        });
      }

      await couponService.deleteCoupon(id);
      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully.'
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete coupon.'
      });
    }
  }
};
