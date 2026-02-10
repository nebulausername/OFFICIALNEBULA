import express from 'express';
import * as verificationController from '../controllers/verification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { uploadPhoto } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
// Public routes (Auth required for submit)
router.post('/submit', verificationController.submitVerification); // Legacy JSON
router.post('/browser-submit', authenticate, uploadPhoto, verificationController.submitBrowserVerification); // New Multipart
// Status check (support both auth header and telegram_id query)
router.post('/gate-check', verificationController.checkGateStatus);
router.post('/applicant-register', uploadPhoto, verificationController.registerApplicant);

// We don't force authenticate here because telegram bot might call it without token, 
// so controller handles logic. But topopulate req.user we need optional auth middleware if possible.
// For now, let's keep it public but check header in controller? 
// Or better: use a middleware that sets req.user if token valid but doesn't fail if not.
// Since we don't have 'optionalAuthenticate', we leave it as is and frontend must use separate route or we assume frontend sends token.
// Actually, for Login.jsx we might not have token yet if only checking via telegram_id.
// So let's leave it public. But if frontend HAS token (e.g. from prev session), it sends it.
// Express doesn't parse Bearer token automatically unless middleware used.
// Let's add specific middleware for optional auth if needed, or just rely on telegram_id for public check.
// WAIT: Authenticated users in Dashboard need to check status. They have token.
// So we can use: router.get('/status', (req, res, next) => { if (req.headers.authorization) authenticate(req, res, next); else next(); }, verificationController.getVerificationStatus);
router.get('/status', (req, res, next) => {
    if (req.headers.authorization) {
        authenticate(req, res, next);
    } else {
        next();
    }
}, verificationController.getVerificationStatus);

// Admin routes
router.get('/pending', authenticate, requireAdmin, verificationController.getPendingVerifications);
router.post('/approve/:id', authenticate, requireAdmin, verificationController.approveVerification);
router.post('/reject/:id', authenticate, requireAdmin, verificationController.rejectVerification);

export default router;
