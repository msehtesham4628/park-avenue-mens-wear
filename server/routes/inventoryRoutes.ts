import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/overview', ...requireAdminOrStaff, inventoryController.getOverview);
router.post('/adjust', ...requireAdminOrStaff, inventoryController.adjustStock);
router.get('/low-stock', ...requireAdminOrStaff, inventoryController.getLowStock);
router.get('/out-of-stock', ...requireAdminOrStaff, inventoryController.getOutOfStock);
router.get('/history', ...requireAdminOrStaff, inventoryController.getHistory);

export default router;
