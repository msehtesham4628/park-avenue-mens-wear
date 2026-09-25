import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';

const router = Router();

router.get('/config', paymentController.getConfig);
router.get('/test-connection', paymentController.testConnection);
router.post('/create-intent', paymentController.createIntent);
router.post('/confirm', paymentController.confirmPayment);
router.post('/webhook', paymentController.handleWebhook);

export default router;
