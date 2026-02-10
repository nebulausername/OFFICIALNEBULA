import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import * as sessionService from '../services/session.service.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = express.Router();

// Standard auth routes
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/telegram-webapp', authController.telegramWebAppAuth);
router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, authController.updateMe);
router.post('/logout', authenticate, authController.logout);

// ==========================================
// 🔐 Cross-Platform Session Management
// ==========================================

// Generate a 6-digit login code (authenticated users only)
router.post('/generate-code', authenticate, async (req, res) => {
    try {
        const result = await sessionService.generateLinkCode(req.user.id, 'login');
        res.json({
            success: true,
            code: result.code,
            expires_at: result.expires_at,
            expires_in_seconds: result.expires_in_seconds,
            message: 'Use this code to login on another device'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate code', message: error.message });
    }
});

// Validate a code and create session (public endpoint)
router.post('/validate-code', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code || code.length !== 6) {
            return res.status(400).json({ error: 'Invalid code format' });
        }

        const deviceType = req.headers['x-device-type'] || 'browser';
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection?.remoteAddress;

        const result = await sessionService.validateLinkCode(code, deviceType, deviceInfo, ipAddress);

        if (!result.valid) {
            return res.status(401).json({
                error: 'Invalid code',
                reason: result.reason,
                verification_status: result.verification_status
            });
        }

        res.json({
            success: true,
            token: result.token,
            user: result.user,
            session: result.session
        });
    } catch (error) {
        res.status(500).json({ error: 'Validation failed', message: error.message });
    }
});

// Get all active sessions for current user
router.get('/sessions', authenticate, async (req, res) => {
    try {
        const sessions = await sessionService.getUserSessions(req.user.id);
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get sessions', message: error.message });
    }
});

// Revoke a specific session
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
    try {
        const result = await sessionService.revokeSession(req.params.sessionId, req.user.id);
        if (!result.success) {
            return res.status(404).json({ error: result.reason });
        }
        res.json({ success: true, message: 'Session revoked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke session', message: error.message });
    }
});

// Revoke all other sessions
router.delete('/sessions', authenticate, async (req, res) => {
    try {
        // TODO: Get current token hash to exclude
        const result = await sessionService.revokeAllSessions(req.user.id);
        res.json({
            success: true,
            message: `${result.count} sessions revoked`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke sessions', message: error.message });
    }
});

export default router;
