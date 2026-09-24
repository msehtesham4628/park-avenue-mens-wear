import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  /**
   * POST /api/payments/create-intent
   */
  async createIntent(req: Request, res: Response) {
    try {
      const { orderId, amount, customerEmail } = req.body;

      if (!orderId || amount === undefined || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'orderId, amount, and customerEmail are required.'
        });
      }

      const result = await paymentService.createPaymentIntent(orderId, parseFloat(amount), customerEmail);

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Payment intent initialized.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/payments/webhook
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const result = await paymentService.handleWebhook(req.body, signature);

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Webhook processed.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
