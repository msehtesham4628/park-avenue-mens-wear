import { Router } from 'express';
import { checkoutController } from '../controllers/checkoutController.js';
import { optionalAuthenticateJWT } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/options', checkoutController.options);
router.post('/', checkoutController.calculate);
router.post('/calculate', checkoutController.calculate);
router.post('/session', optionalAuthenticateJWT, checkoutController.createSession);
export default router;
