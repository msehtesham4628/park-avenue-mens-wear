import { Router } from 'express';
import { alterationController } from '../controllers/alterationController.js';
import { orderLookupLimiter } from '../middleware/rateLimiter.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', ...requireAdminOrStaff, alterationController.getAlterations);
router.post('/', alterationController.createAlteration);
router.post('/lookup', orderLookupLimiter, alterationController.customerLookup);

// Admin alteration routes must be declared before /:id so "admin" is not treated as an alteration ID.
router.get('/admin/list', ...requireAdminOrStaff, alterationController.getAdminAlterations);
router.put('/admin/:id/status', ...requireAdminOrStaff, alterationController.updateStatus);

router.get('/:id', alterationController.getAlterationById);

export default router;
