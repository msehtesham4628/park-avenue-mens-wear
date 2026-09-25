import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { orderLookupLimiter } from '../middleware/rateLimiter.js';
import { authenticateJWT, requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

// Storefront & Client routes
router.get('/', authenticateJWT, orderController.getOrders);
router.post('/', orderController.createOrder);
router.post('/lookup', orderLookupLimiter, orderController.customerLookup);

// Admin order routes (support both /admin/list and /list, /admin/:id/status and /:id/status)
router.get('/admin/list', ...requireAdminOrStaff, orderController.getAdminOrders);
router.get('/list', ...requireAdminOrStaff, orderController.getAdminOrders);
router.put('/admin/:id/status', ...requireAdminOrStaff, orderController.updateOrderStatus);
router.put('/:id/status', ...requireAdminOrStaff, orderController.updateOrderStatus);

router.get('/:id', authenticateJWT, orderController.getOrderById);

export default router;
