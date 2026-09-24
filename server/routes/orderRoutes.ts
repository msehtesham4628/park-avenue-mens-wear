import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { orderLookupLimiter } from '../middleware/rateLimiter.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

// Storefront & Client routes
router.post('/', orderController.createOrder);
router.post('/lookup', orderLookupLimiter, orderController.customerLookup);
router.get('/:id', orderController.getOrderById);

// Admin order routes
router.get('/admin/list', ...requireAdminOrStaff, orderController.getAdminOrders);
router.put('/admin/:id/status', ...requireAdminOrStaff, orderController.updateOrderStatus);

export default router;
