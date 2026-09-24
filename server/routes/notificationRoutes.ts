import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/admin/history', ...requireAdminOrStaff, notificationController.getHistory);
router.post('/admin/send', ...requireAdminOrStaff, notificationController.sendCustom);
// Public proxy dispatch endpoint for frontend communication gateway integration
router.post('/dispatch', notificationController.sendCustom);

export default router;
