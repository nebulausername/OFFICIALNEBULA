import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateId, validatePagination, validateIdParam } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin); // All admin routes require admin role

router.get('/stats', adminController.getStats);
router.get('/diagnostics', adminController.getDiagnostics);
router.get('/sales-data', adminController.getSalesData);
router.get('/top-products', adminController.getTopProducts);
router.get('/category-revenue', adminController.getCategoryRevenue);
router.get('/user-growth', adminController.getUserGrowth);
router.get('/recent-activity', adminController.getRecentActivity);
router.get('/users', validatePagination, adminController.listUsers);
router.patch('/users/:id/vip', validateId, adminController.toggleVIP);
router.post('/products/bulk-import', adminController.bulkImportProducts);

router.get('/chats', adminController.getChatSessions);
router.get('/chats/:sessionId/messages', validateIdParam('sessionId'), adminController.getChatHistory);

// Telegram Settings
router.get('/telegram/config', adminController.getTelegramConfig);
router.post('/telegram/test-notification', adminController.sendTestNotification);

export default router;

