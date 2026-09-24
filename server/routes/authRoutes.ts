import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateJWT, authController.getMe);

export default router;
