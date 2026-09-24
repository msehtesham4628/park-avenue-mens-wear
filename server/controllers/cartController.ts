import { Request, Response } from 'express';
import { cartService } from '../services/cartService.js';

function getSessionId(req: Request): string {
  const headerSession = req.headers['x-session-id'] as string;
  if (headerSession) return headerSession;
  return req.cookies?.['pa_session_id'] || 'session-default-atelier';
}

export const cartController = {
  /**
   * GET /api/cart
   */
  async getCart(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      const customerId = (req as any).user?.customerId;
      const cart = await cartService.getOrCreateCart(sessionId, customerId);

      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/cart/items
   */
  async addItem(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      const customerId = (req as any).user?.customerId;
      const { productId, variantId, size, color, quantity } = req.body;

      if (!productId || !size || !color) {
        return res.status(400).json({
          success: false,
          message: 'productId, size, and color are required.'
        });
      }

      const cart = await cartService.addItem(sessionId, {
        productId,
        variantId,
        size,
        color,
        quantity: parseInt(quantity || '1', 10)
      }, customerId);

      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Item added to shopping bag.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * PUT /api/cart/items/:productId
   */
  async updateQuantity(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      const { productId } = req.params;
      const { variantId, quantity } = req.body;

      if (quantity === undefined) {
        return res.status(400).json({ success: false, message: 'quantity is required.' });
      }

      const cart = await cartService.updateItemQuantity(
        sessionId,
        productId,
        variantId,
        parseInt(quantity, 10)
      );

      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart item updated.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * DELETE /api/cart/items/:productId
   */
  async removeItem(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      const { productId } = req.params;
      const { variantId } = req.query;

      const cart = await cartService.removeItem(sessionId, productId, variantId as string);

      return res.status(200).json({
        success: true,
        data: cart,
        message: 'Item removed from shopping bag.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/cart/validate
   */
  async validateCart(req: Request, res: Response) {
    try {
      const sessionId = getSessionId(req);
      const cart = await cartService.getOrCreateCart(sessionId);
      const validation = await cartService.validateCart(cart);

      return res.status(200).json({
        success: true,
        data: {
          cart,
          validation
        },
        message: validation.isValid ? 'Cart items and stock verified.' : 'Some items have inventory changes.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
