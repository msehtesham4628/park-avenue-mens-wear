import { Router } from 'express';
import { alterationController } from '../controllers/alterationController.js';
import { orderLookupLimiter } from '../middleware/rateLimiter.js';
import { authenticateJWT, optionalAuthenticateJWT, requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJWT, alterationController.getAlterations);
router.post('/', alterationController.createAlteration);
router.post('/lookup', orderLookupLimiter, alterationController.customerLookup);

// Admin alteration routes (support both /admin/list and /list, /admin/:id/status and /:id/status)
router.get('/admin/list', ...requireAdminOrStaff, alterationController.getAdminAlterations);
router.get('/list', ...requireAdminOrStaff, alterationController.getAdminAlterations);
router.put('/admin/:id/status', ...requireAdminOrStaff, alterationController.updateStatus);
router.put('/:id/status', ...requireAdminOrStaff, alterationController.updateStatus);

router.get('/:id', optionalAuthenticateJWT, alterationController.getAlterationById);

export default router;
