import { Request, Response } from 'express';
import { ProductModel } from '../models/Product.js';
import { OrderModel } from '../models/Order.js';
import { CustomerModel } from '../models/Customer.js';
import { AlterationModel } from '../models/Alteration.js';

export const dashboardController = {
  /**
   * GET /api/admin/dashboard/stats
   */
  async getDashboardStats(_req: Request, res: Response) {
    try {
      const [
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        totalCustomers,
        pendingAlterations,
        lowStockItems,
        outOfStockItems
      ] = await Promise.all([
        ProductModel.countDocuments(),
        ProductModel.find({ isActive: true }).select('stockQuantity variants lowStockThreshold').lean(),
        OrderModel.countDocuments(),
        OrderModel.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] } }),
        OrderModel.countDocuments({ orderStatus: { $in: ['Shipped', 'Out for Delivery'] } }),
        OrderModel.countDocuments({ orderStatus: 'Delivered' }),
        CustomerModel.countDocuments({ role: 'customer' }),
        AlterationModel.countDocuments({ currentStatus: { $nin: ['Completed', 'Cancelled'] } }),
        ProductModel.countDocuments({
          isActive: true,
          $expr: { $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', '$lowStockThreshold'] }] }
        }),
        ProductModel.countDocuments({ isActive: true, stockQuantity: { $lte: 0 } })
      ]);

      const totalInventory = activeProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);

      // Financial metric
      const orders = await OrderModel.find().select('total orderStatus').lean();
      const grossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalInventory,
          lowStockCount: lowStockItems,
          outOfStockCount: outOfStockItems,
          totalOrders,
          pendingOrders,
          shippedOrders,
          deliveredOrders,
          totalCustomers,
          pendingAlterations,
          grossRevenue
        },
        message: 'Dashboard metrics calculated.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
