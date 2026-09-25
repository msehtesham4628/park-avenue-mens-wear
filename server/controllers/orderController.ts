import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { orderService } from '../services/orderService.js';
import { OrderModel } from '../models/Order.js';

export const orderController = {
  /**
   * POST /api/orders (Storefront order submission)
   */
  async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        items,
        shippingInfo,
        shippingFee,
        shippingMethod,
        tax,
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
        shippingFee,
        shippingMethod,
        tax,
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
   * GET /api/orders (authenticated customer/admin list)
   * Customers only receive their own orders; admin/staff receive the same
   * filtered/paginated order list used by the admin console.
   */
  async getOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { status, search, page, limit } = req.query;
      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 20;

      if (req.user.role === 'admin' || req.user.role === 'staff') {
        const result = await orderService.getOrders({
          status: status as string,
          search: search as string,
          page: pageNumber,
          limit: limitNumber
        });
        return res.status(200).json({ success: true, data: result.orders, pagination: result.pagination });
      }

      const customer = await import('../models/Customer.js').then(m =>
        m.CustomerModel.findOne({ customerId: req.user!.customerId }).lean()
      );
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer profile not found.' });
      }

      const orders = await OrderModel.find({
        $or: [
          { customerId: customer.customerId },
          { customerEmail: customer.email }
        ]
      }).sort({ createdAt: -1 }).lean();

      return res.status(200).json({ success: true, data: orders, pagination: { page: 1, limit: orders.length, total: orders.length, totalPages: 1 } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Unable to load orders.' });
    }
  },

  /**
   * GET /api/orders/:id
   */
  async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findOne({ orderId: id }).lean();

      if (!order) {
        return res.status(404).json({ success: false, message: `Order ${id} not found.` });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        const ownsOrder = order.customerId === req.user.customerId || order.customerEmail === req.user.email.toLowerCase();
        if (!ownsOrder) {
          return res.status(403).json({ success: false, message: 'Access denied: this order does not belong to the authenticated customer.' });
        }
      }

      const safeOrder = req.user.role === 'admin' || req.user.role === 'staff' ? order : {
        ...order,
        notes: undefined,
        paymentTransactionId: undefined,
        stripeSessionId: undefined,
        stripePaymentIntentId: undefined,
        shipment: order.shipment ? { ...order.shipment, notes: undefined } : undefined
      };
      return res.status(200).json({ success:true, data:safeOrder, message:'Order retrieved successfully.' });
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
        trackingNumber: order.trackingNumber || (order as any).shipment?.trackingId,
        trackingUrl: (order as any).trackingUrl || (order as any).shipment?.trackingUrl,
        carrier: (order as any).carrier || order.shippingInfo.carrier || (order as any).shipment?.carrier,
        shipment: (order as any).shipment,
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

  async updateShipment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !['admin','staff'].includes(req.user.role)) return res.status(403).json({ success:false, message:'Admin or Executive access required.' });
      const { id } = req.params;
      const { carrier, trackingId, trackingUrl, status, estimatedDelivery, notes } = req.body;
      if (!carrier || !trackingId || !status) return res.status(400).json({ success:false, message:'Carrier, tracking ID and shipment status are required.' });
      const order = await orderService.updateShipment(id, { id:req.user.id, name:req.user.name, email:req.user.email, role:req.user.role }, { carrier, trackingId, trackingUrl, status, estimatedDelivery, notes });
      return res.status(200).json({ success:true, data:order, message:'Shipment information updated.' });
    } catch(err:any) { return res.status(400).json({ success:false, message:err.message }); }
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
      const { status, note, trackingNumber, carrier, estimatedDelivery, customNotificationMessage, notificationChannel } = req.body;

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
          carrier,
          estimatedDelivery,
          customNotificationMessage,
          notificationChannel
        }
      );

      return res.status(200).json({
        success: true,
        data: order,
        message: `Order status updated to ${status}. Customer notification recorded; delivery depends on the configured notification provider.`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
