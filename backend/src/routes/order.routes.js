import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createOrderSchema } from '../schemas/order.schema.js';

const router = express.Router();

// Open routes (optional auth for guest checkout/inquiry)
import { optionalAuth } from '../middleware/auth.middleware.js';

router.post('/', optionalAuth, validateRequest(createOrderSchema), orderController.createOrder);

router.use(authenticate); // Protected routes below

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', requireAdmin, orderController.updateOrderStatus);

export default router;

