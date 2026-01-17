import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateProduct, validateProductUpdate, validateId, validatePagination } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validatePagination, productController.listProducts);
router.get('/:id', optionalAuth, validateId, productController.getProduct);
router.get('/:id/images', optionalAuth, validateId, productController.getProductImages);

// Admin routes
router.post('/', authenticate, requireAdmin, validateProduct, productController.createProduct);
router.patch('/:id', authenticate, requireAdmin, validateId, validateProductUpdate, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, validateId, productController.deleteProduct);

export default router;

