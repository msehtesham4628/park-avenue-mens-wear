import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { optionalAuthenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/config', paymentController.getConfig);
router.get('/test-connection', paymentController.testConnection);
router.post('/create-intent', optionalAuthenticateJWT, paymentController.createIntent);
router.post('/confirm', optionalAuthenticateJWT, paymentController.confirmPayment);
router.post('/webhook', paymentController.handleWebhook);

export default router;
