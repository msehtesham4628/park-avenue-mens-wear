import { Router } from 'express';
import { cartController } from '../controllers/cartController.js';

const router = Router();

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:productId', cartController.updateQuantity);
router.delete('/items/:productId', cartController.removeItem);
router.post('/validate', cartController.validateCart);

export default router;
