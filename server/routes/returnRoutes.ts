import { Router } from 'express';
import { returnController } from '../controllers/returnController.js';
import { orderLookupLimiter } from '../middleware/rateLimiter.js';
import { authenticateJWT, optionalAuthenticateJWT, requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

// Storefront & Customer Routes
router.post('/', optionalAuthenticateJWT, returnController.createReturn);
router.get('/my-returns', authenticateJWT, returnController.getMyReturns);
router.get('/lookup/:id', orderLookupLimiter, returnController.getReturnById);

// Admin Routes (list & manage)
router.get('/', ...requireAdminOrStaff, returnController.getReturns);
router.get('/admin/list', ...requireAdminOrStaff, returnController.getReturns);
router.put('/:id/status', ...requireAdminOrStaff, returnController.updateReturnStatus);
router.put('/admin/:id/status', ...requireAdminOrStaff, returnController.updateReturnStatus);

// Direct single lookup
router.get('/:id', optionalAuthenticateJWT, returnController.getReturnById);

export default router;
