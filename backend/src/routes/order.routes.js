import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createOrderSchema } from '../schemas/order.schema.js';

const router = express.Router();

router.use(authenticate); // All order routes require authentication

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.patch('/:id/status', requireAdmin, orderController.updateOrderStatus);

export default router;

