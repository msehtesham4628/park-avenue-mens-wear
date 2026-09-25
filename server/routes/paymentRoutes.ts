import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/config', paymentController.getConfig);
router.get('/test-connection', paymentController.testConnection);
router.post('/create-intent', authenticateJWT, paymentController.createIntent);
router.post('/confirm', authenticateJWT, paymentController.confirmPayment);
router.post('/webhook', paymentController.handleWebhook);

export default router;
