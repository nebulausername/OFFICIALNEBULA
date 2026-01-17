import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateOrder, validateId, validatePagination } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate); // All order routes require authentication

router.get('/', validatePagination, orderController.listOrders);
router.get('/:id', validateId, orderController.getOrder);
router.post('/', validateOrder, orderController.createOrder);
router.patch('/:id/status', validateId, requireAdmin, orderController.updateOrderStatus);

export default router;

