import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', ...requireAdminOrStaff, dashboardController.getDashboardStats);
router.get('/stats', ...requireAdminOrStaff, dashboardController.getDashboardStats);

export default router;
