import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  /**
   * GET /api/payments/config
   * Returns current gateway configuration (publishable key, provider, mode)
   */
  async getConfig(_req: Request, res: Response) {
    try {
      const config = paymentService.getConfig();
      return res.status(200).json({
        success: true,
        data: config,
        message: 'Payment configuration retrieved.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/payments/test-connection
   * Tests Stripe connection with configured keys
   */
  async testConnection(_req: Request, res: Response) {
    try {
      const result = await paymentService.testConnection();
      return res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/payments/create-intent
   */
  async createIntent(req: Request, res: Response) {
    try {
      const { orderId, amount, customerEmail, customerName } = req.body;

      if (!orderId || amount === undefined || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'orderId, amount, and customerEmail are required.'
        });
      }

      const result = await paymentService.createPaymentIntent(
        orderId,
        parseFloat(amount),
        customerEmail,
        customerName
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Stripe payment intent initialized.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/payments/confirm
   */
  async confirmPayment(req: Request, res: Response) {
    try {
      const { orderId, transactionId, paymentMethodDetails } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'orderId is required.'
        });
      }

      const updatedOrder = await paymentService.confirmPayment(
        orderId,
        transactionId,
        paymentMethodDetails
      );

      return res.status(200).json({
        success: true,
        data: updatedOrder,
        message: 'Payment confirmed successfully.'
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
      const rawBody = (req as any).rawBody as Buffer | undefined;
      const result = await paymentService.handleWebhook(req.body, signature, rawBody);

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Stripe webhook processed.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
