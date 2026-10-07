import { Router } from 'express';
import { couponController } from '../controllers/couponController.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

// Public validation endpoint for Cart & Checkout
router.get('/validate', couponController.validate);

// Coupon listing (accessible in admin dashboard or cart)
router.get('/', couponController.getAll);

// Admin-only management endpoints for creating and deleting coupons
router.post('/', ...requireAdminOrStaff, couponController.create);
router.delete('/:id', ...requireAdminOrStaff, couponController.delete);

// Admin routes compatibility aliases
router.post('/admin', ...requireAdminOrStaff, couponController.create);
router.delete('/admin/:id', ...requireAdminOrStaff, couponController.delete);

export default router;
