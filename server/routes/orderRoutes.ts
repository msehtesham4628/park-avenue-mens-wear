import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { orderLookupLimiter } from '../middleware/rateLimiter.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

// Storefront & Client routes
router.get('/', ...requireAdminOrStaff, orderController.getOrders);
router.post('/', orderController.createOrder);
router.post('/lookup', orderLookupLimiter, orderController.customerLookup);

// Admin order routes must be declared before /:id so "admin" is not treated as an order ID.
router.get('/admin/list', ...requireAdminOrStaff, orderController.getAdminOrders);
router.put('/admin/:id/status', ...requireAdminOrStaff, orderController.updateOrderStatus);

router.get('/:id', orderController.getOrderById);

export default router;
