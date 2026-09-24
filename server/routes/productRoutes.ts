import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { requireAdminOrStaff, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Storefront public endpoints
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin endpoints mounted under /api/products/admin or /api/admin/products
router.post('/admin/batch', ...requireAdminOrStaff, productController.batchCreateProducts);
router.post('/admin', ...requireAdminOrStaff, productController.createProduct);
router.put('/admin/:id', ...requireAdminOrStaff, productController.updateProduct);
router.delete('/admin/:id', ...requireAdmin, productController.deleteProduct);

export default router;
