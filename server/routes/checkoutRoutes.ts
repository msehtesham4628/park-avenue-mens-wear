import { Router } from 'express';
import { checkoutController } from '../controllers/checkoutController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/options', checkoutController.options);
router.post('/calculate', checkoutController.calculate);
router.post('/session', authenticateJWT, checkoutController.createSession);
export default router;
