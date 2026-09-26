import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', ...requireAdminOrStaff, dashboardController.getDashboardStats);
router.get('/stats', ...requireAdminOrStaff, dashboardController.getDashboardStats);
router.get('/logs', ...requireAdminOrStaff, dashboardController.getAuditLogs);
router.post('/logs', ...requireAdminOrStaff, dashboardController.createAuditLog);

export default router;

