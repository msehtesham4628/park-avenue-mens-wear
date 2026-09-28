import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import alterationRoutes from './alterationRoutes.js';
import customerRoutes from './customerRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import returnRoutes from './returnRoutes.js';
import seoRoutes from './seoRoutes.js';
import { API_DOCUMENTATION } from '../docs/apiDocs.js';
import { isDbConnected } from '../config/db.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  const connected = isDbConnected();
  res.status(connected ? 200 : 503).json({
    status: 'online',
    service: 'Park Avenue Menswear API',
    database: connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Interactive / JSON API Documentation
apiRouter.get('/docs', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: API_DOCUMENTATION
  });
});

// Core API Modules
apiRouter.use('/auth', authRoutes);
// Compatibility aliases for deployments where nested /api/auth/* paths are rewritten differently.
apiRouter.use('/', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/alterations', alterationRoutes);
apiRouter.use('/returns', returnRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/checkout', checkoutRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/seo', seoRoutes);

// Admin Specific Modules
apiRouter.use('/admin/inventory', inventoryRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/admin/customers', customerRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/admin/dashboard', dashboardRoutes);
apiRouter.use('/admin/logs', dashboardRoutes);
apiRouter.use('/admin/notifications', notificationRoutes);

// Admin aliases to match prompt specification (e.g. POST /api/admin/products, PUT /api/admin/products/:id)
apiRouter.use('/admin/products', productRoutes);
apiRouter.use('/admin/orders', orderRoutes);
apiRouter.use('/admin/alterations', alterationRoutes);
apiRouter.use('/admin/returns', returnRoutes);

export default apiRouter;
