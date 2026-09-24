import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { requireAdminOrStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/admin/list', ...requireAdminOrStaff, customerController.getCustomers);
router.get('/admin/search', ...requireAdminOrStaff, customerController.searchCustomers);
router.get('/admin/:id', ...requireAdminOrStaff, customerController.getCustomerProfile);
router.put('/admin/:id', ...requireAdminOrStaff, customerController.updateCustomer);

export default router;
