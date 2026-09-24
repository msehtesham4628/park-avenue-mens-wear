import { Router } from 'express';
import { alterationController } from '../controllers/alterationController.js';
import { orderLookupLimiter } from '../middleware/rateLimiter.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', alterationController.createAlteration);
router.post('/lookup', orderLookupLimiter, alterationController.customerLookup);
router.get('/:id', alterationController.getAlterationById);

// Admin alteration routes
router.get('/admin/list', ...requireAdminOrStaff, alterationController.getAdminAlterations);
router.put('/admin/:id/status', ...requireAdminOrStaff, alterationController.updateStatus);

export default router;
