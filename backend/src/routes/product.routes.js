import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateRequest, validateId } from '../middleware/validate.middleware.js';
import { productSchema, productUpdateSchema } from '../schemas/product.schema.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, productController.listProducts); // Pagination validation can be added later or inline
router.get('/:id', optionalAuth, productController.getProduct);
router.get('/:id/images', optionalAuth, productController.getProductImages);

// Admin routes
router.post('/', authenticate, requireAdmin, validateRequest(productSchema), productController.createProduct);
router.patch('/:id', authenticate, requireAdmin, validateRequest(productUpdateSchema), productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, validateId, productController.deleteProduct);

export default router;

