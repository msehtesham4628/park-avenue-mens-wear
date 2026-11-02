import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { requireAdminOrStaff, requireAdmin, authenticateAdminOrStaffOrFallback } from '../middleware/authMiddleware.js';

const router = Router();

// Streaming & public endpoints (specific subpaths must precede generic :slug)
router.get('/pdf/:pdfId', productController.getProductPdf);
router.get('/:slug/pdf/:pdfId', productController.getProductPdf);
router.get('/:slug/image/:index', productController.getProductImage);
router.get('/image/:slug/:index', productController.getProductImage);
router.get('/:slug/color-image/:color/:index', productController.getProductColorImage);
router.get('/color-image/:slug/:color/:index', productController.getProductColorImage);
router.get('/admin/:slug', productController.getProductBySlug);

// Storefront public endpoints
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

// Intelligent Sartorial Auto Title, SKU & Auto Description Endpoints
router.post('/generate-title', productController.generateTitle);
router.post('/admin/generate-title', productController.generateTitle);
router.post('/generate-sku', productController.generateSku);
router.post('/generate-description', productController.generateDescription);
router.post('/admin/generate-sku', productController.generateSku);
router.post('/admin/generate-description', productController.generateDescription);
router.post('/batch-auto-sku', authenticateAdminOrStaffOrFallback, productController.batchAutoSku);
router.post('/admin/batch-auto-sku', authenticateAdminOrStaffOrFallback, productController.batchAutoSku);

// Admin endpoints mounted under /api/products, /api/products/admin, or /api/admin/products
router.post('/admin/batch', authenticateAdminOrStaffOrFallback, productController.batchCreateProducts);
router.post('/batch', authenticateAdminOrStaffOrFallback, productController.batchCreateProducts);
router.post('/admin', authenticateAdminOrStaffOrFallback, productController.createProduct);
router.post('/', authenticateAdminOrStaffOrFallback, productController.createProduct);
router.put('/admin/:id', authenticateAdminOrStaffOrFallback, productController.updateProduct);
router.put('/:id', authenticateAdminOrStaffOrFallback, productController.updateProduct);
router.delete('/admin/:id', authenticateAdminOrStaffOrFallback, productController.deleteProduct);
router.delete('/:id', authenticateAdminOrStaffOrFallback, productController.deleteProduct);

export default router;
