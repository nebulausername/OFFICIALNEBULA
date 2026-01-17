import express from 'express';
import * as verificationController from '../controllers/verification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public routes
router.post('/submit', verificationController.submitVerification);
router.get('/status', verificationController.getVerificationStatus);

// Admin routes
router.get('/pending', authenticate, requireAdmin, verificationController.getPendingVerifications);
router.post('/approve/:id', authenticate, requireAdmin, verificationController.approveVerification);
router.post('/reject/:id', authenticate, requireAdmin, verificationController.rejectVerification);

export default router;
