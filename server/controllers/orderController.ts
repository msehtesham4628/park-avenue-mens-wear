import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orderService } from '../services/orderService.js';
import { OrderModel } from '../models/Order.js';

export const orderController = {
  /**
   * POST /api/orders (Storefront order submission)
   */
  async createOrder(req: Request, res: Response) {
    try {
      const {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        items,
        shippingInfo,
        paymentMethod,
        paymentTransactionId,
        notes,
        preferredNotificationChannel
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone || !items || !shippingInfo) {
        return res.status(400).json({
          success: false,
          message: 'Client details, shipping information, and order items are required.'
        });
      }

      const order = await orderService.createOrder({
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        items,
        shippingInfo,
        paymentMethod,
        paymentTransactionId,
        notes,
        preferredNotificationChannel
      });

      return res.status(201).json({
        success: true,
        data: order,
        message: 'Order placed and reserved successfully.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/orders/:id
   */
  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findOne({ orderId: id }).lean();

      if (!order) {
        return res.status(404).json({ success: false, message: `Order ${id} not found.` });
      }

      return res.status(200).json({
        success: true,
        data: order,
        message: 'Order retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/orders/lookup (Customer Order Lookup)
   * Secure lookup by Order ID + Email or Phone.
   * Rate limited, masks sensitive payment data.
   */
  async customerLookup(req: Request, res: Response) {
    try {
      const { orderId, contact } = req.body;

      if (!orderId || !contact) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both Order ID and Email or Phone number.'
        });
      }

      const order = await orderService.customerLookup(orderId, contact);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'No matching order found for the provided credentials.'
        });
      }

      // Safe representation: strip internal database IDs and payment transaction tokens
      const safeOrder = {
        orderId: order.orderId,
        customerName: order.customerName,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shippingInfo: {
          recipientName: order.shippingInfo.recipientName,
          city: order.shippingInfo.city,
          state: order.shippingInfo.state,
          country: order.shippingInfo.country,
          carrier: order.shippingInfo.carrier,
          shippingMethod: order.shippingInfo.shippingMethod,
          estimatedDelivery: order.shippingInfo.estimatedDelivery
        },
        trackingNumber: order.trackingNumber,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt
      };

      return res.status(200).json({
        success: true,
        data: safeOrder,
        message: 'Order tracking details retrieved.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * GET /api/admin/orders (Admin list orders)
   */
  async getAdminOrders(req: Request, res: Response) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await orderService.getOrders({
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20
      });

      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
        message: 'Orders loaded successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * PUT /api/admin/orders/:id/status (Admin change order status)
   */
  async updateOrderStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user || { id: 'ADMIN', name: 'Admin', email: 'admin@parkavenuemenswear.com', role: 'admin' };
      const { id } = req.params;
      const { status, note, trackingNumber, customNotificationMessage, notificationChannel } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
      }

      const order = await orderService.updateOrderStatus(
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
          trackingNumber,
          customNotificationMessage,
          notificationChannel
        }
      );

      return res.status(200).json({
        success: true,
        data: order,
        message: `Order status updated to ${status}. Customer notification dispatched.`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
