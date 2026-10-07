import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

// Public patron endpoints (accessible by website visitors and logged in customers)
router.get('/', notificationController.getPublic);
router.get('/public', notificationController.getPublic);
router.post('/read-all', notificationController.markAllRead);
router.post('/:id/read', notificationController.markRead);

// Admin-only management endpoints
router.get('/history', ...requireAdminOrStaff, notificationController.getHistory);
router.get('/admin/history', ...requireAdminOrStaff, notificationController.getHistory);
router.post('/send', ...requireAdminOrStaff, notificationController.sendCustom);
router.post('/admin/send', ...requireAdminOrStaff, notificationController.sendCustom);
router.delete('/:id', ...requireAdminOrStaff, notificationController.deleteNotification);
router.delete('/admin/:id', ...requireAdminOrStaff, notificationController.deleteNotification);

// Public proxy dispatch endpoint for concierge gateway
router.post('/dispatch', notificationController.sendCustom);

export default router;
