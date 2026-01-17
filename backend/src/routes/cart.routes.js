import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateId } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate); // All cart routes require authentication

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/:id', validateId, cartController.updateCartItem);
router.delete('/:id', validateId, cartController.removeCartItem);
router.delete('/', cartController.clearCart);

export default router;

