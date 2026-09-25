import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { requireAdminOrStaff, optionalAuthenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticateJWT, customerController.getCustomers);
router.get('/list', optionalAuthenticateJWT, customerController.getCustomers);
router.get('/admin/list', ...requireAdminOrStaff, customerController.getCustomers);
router.get('/search', ...requireAdminOrStaff, customerController.searchCustomers);
router.get('/admin/search', ...requireAdminOrStaff, customerController.searchCustomers);
router.get('/:id', optionalAuthenticateJWT, customerController.getCustomerProfile);
router.get('/admin/:id', ...requireAdminOrStaff, customerController.getCustomerProfile);
router.put('/:id', optionalAuthenticateJWT, customerController.updateCustomer);
router.put('/admin/:id', ...requireAdminOrStaff, customerController.updateCustomer);

export default router;
