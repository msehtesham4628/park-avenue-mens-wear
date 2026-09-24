import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-intent', paymentController.createIntent);
router.post('/webhook', paymentController.handleWebhook);

export default router;
