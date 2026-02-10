import prisma from '../config/database.js';
import crypto from 'crypto';
import { generateToken, verifyToken } from '../config/jwt.js';
import { botLogger as logger } from '../utils/botLogger.js';

// ==========================================
// 🔐 Session Management Service
// Cross-Platform Auth (Browser ↔ Telegram)
// ==========================================

const SESSION_DURATION_DAYS = 7;
const LINK_CODE_EXPIRY_MINUTES = 5;

/**
 * Hash a token for secure storage
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a 6-digit numeric code
 */
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create a new authenticated session
 */
export const createSession = async (userId, deviceType, deviceInfo = null, ipAddress = null) => {
    try {
        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, telegram_id: true, role: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            telegram_id: user.telegram_id?.toString(),
            role: user.role,
        });

        const tokenHash = hashToken(token);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

        // Create session record
        const session = await prisma.authSession.create({
            data: {
                user_id: userId,
                token_hash: tokenHash,
                device_type: deviceType,
                device_info: deviceInfo,
                ip_address: ipAddress,
                expires_at: expiresAt,
            }
        });

        // Update user login stats
        await prisma.user.update({
            where: { id: userId },
            data: {
                last_login_at: new Date(),
                login_count: { increment: 1 }
            }
        });

        logger.info(`Session created for user ${userId} on ${deviceType}`);

        return {
            token,
            session: {
                id: session.id,
                device_type: session.device_type,
                expires_at: session.expires_at,
            }
        };
    } catch (error) {
        logger.error('Error creating session:', error);
        throw error;
    }
};

/**
 * Validate a session token
 */
export const validateSession = async (token) => {
    try {
        // Verify JWT first
        const decoded = verifyToken(token);
        if (!decoded) {
            return { valid: false, reason: 'Invalid token' };
        }

        const tokenHash = hashToken(token);

        // Check session in database
        const session = await prisma.authSession.findUnique({
            where: { token_hash: tokenHash },
            include: { user: true }
        });

        if (!session) {
            return { valid: false, reason: 'Session not found' };
        }

        if (!session.is_active) {
            return { valid: false, reason: 'Session revoked' };
        }

        if (new Date() > session.expires_at) {
            // Auto-cleanup expired session
            await prisma.authSession.update({
                where: { id: session.id },
                data: { is_active: false }
            });
            return { valid: false, reason: 'Session expired' };
        }

        // Update last used
        await prisma.authSession.update({
            where: { id: session.id },
            data: { last_used_at: new Date() }
        });

        return {
            valid: true,
            user: session.user,
            session: {
                id: session.id,
                device_type: session.device_type
            }
        };
    } catch (error) {
        logger.error('Error validating session:', error);
        return { valid: false, reason: 'Validation error' };
    }
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId, userId) => {
    try {
        const session = await prisma.authSession.findFirst({
            where: { id: sessionId, user_id: userId }
        });

        if (!session) {
            return { success: false, reason: 'Session not found' };
        }

        await prisma.authSession.update({
            where: { id: sessionId },
            data: { is_active: false }
        });

        logger.info(`Session ${sessionId} revoked for user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error('Error revoking session:', error);
        throw error;
    }
};

/**
 * Revoke all sessions for a user (except current)
 */
export const revokeAllSessions = async (userId, exceptTokenHash = null) => {
    try {
        const whereClause = {
            user_id: userId,
            is_active: true
        };

        if (exceptTokenHash) {
            whereClause.token_hash = { not: exceptTokenHash };
        }

        const result = await prisma.authSession.updateMany({
            where: whereClause,
            data: { is_active: false }
        });

        logger.info(`Revoked ${result.count} sessions for user ${userId}`);
        return { success: true, count: result.count };
    } catch (error) {
        logger.error('Error revoking all sessions:', error);
        throw error;
    }
};

/**
 * Get all active sessions for a user
 */
export const getUserSessions = async (userId) => {
    try {
        const sessions = await prisma.authSession.findMany({
            where: {
                user_id: userId,
                is_active: true,
                expires_at: { gt: new Date() }
            },
            orderBy: { last_used_at: 'desc' },
            select: {
                id: true,
                device_type: true,
                device_info: true,
                ip_address: true,
                last_used_at: true,
                created_at: true,
                expires_at: true
            }
        });

        return sessions;
    } catch (error) {
        logger.error('Error getting user sessions:', error);
        throw error;
    }
};

// ==========================================
// 🔗 Link Code System (Cross-Platform Login)
// ==========================================

/**
 * Generate a 6-digit login code for cross-platform auth
 */
export const generateLinkCode = async (userId, purpose = 'login') => {
    try {
        // Invalidate any existing codes for this user/purpose
        await prisma.authLinkCode.updateMany({
            where: {
                user_id: userId,
                purpose,
                used_at: null,
                expires_at: { gt: new Date() }
            },
            data: { expires_at: new Date() } // Expire immediately
        });

        // Generate new code
        let code;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            code = generateCode();
            const existing = await prisma.authLinkCode.findUnique({
                where: { code }
            });
            if (!existing || existing.expires_at < new Date()) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw new Error('Could not generate unique code');
        }

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + LINK_CODE_EXPIRY_MINUTES);

        await prisma.authLinkCode.create({
            data: {
                user_id: userId,
                code,
                purpose,
                expires_at: expiresAt
            }
        });

        logger.info(`Link code generated for user ${userId} (purpose: ${purpose})`);

        return {
            code,
            expires_at: expiresAt,
            expires_in_seconds: LINK_CODE_EXPIRY_MINUTES * 60
        };
    } catch (error) {
        logger.error('Error generating link code:', error);
        throw error;
    }
};

/**
 * Validate a link code and create a new session
 */
export const validateLinkCode = async (code, deviceType, deviceInfo = null, ipAddress = null) => {
    try {
        // DEV BACKDOOR: Master Code for Local Development
        if (process.env.NODE_ENV === 'development' && code === '999999') {
            logger.warn('⚠️  USING DEV BACKDOOR LOGIN WITH MASTER CODE');

            // Find the specific admin user created by ensure-admin.js
            const adminUser = await prisma.user.findFirst({
                where: { telegram_id: 8120079318n }
            });

            if (adminUser) {
                const { token, session } = await createSession(
                    adminUser.id,
                    deviceType,
                    deviceInfo,
                    ipAddress
                );

                return {
                    valid: true,
                    token,
                    session,
                    user: {
                        id: adminUser.id,
                        telegram_id: adminUser.telegram_id?.toString(),
                        username: adminUser.username,
                        full_name: adminUser.full_name,
                        role: adminUser.role,
                        verification_status: adminUser.verification_status
                    }
                };
            }
        }

        const linkCode = await prisma.authLinkCode.findUnique({
            where: { code },
            include: { user: true }
        });

        if (!linkCode) {
            return { valid: false, reason: 'Invalid code' };
        }

        if (linkCode.used_at) {
            return { valid: false, reason: 'Code already used' };
        }

        if (new Date() > linkCode.expires_at) {
            return { valid: false, reason: 'Code expired' };
        }

        // Check if user is verified
        if (linkCode.user.verification_status !== 'verified') {
            return {
                valid: false,
                reason: 'User not verified',
                verification_status: linkCode.user.verification_status
            };
        }

        // Mark code as used
        await prisma.authLinkCode.update({
            where: { id: linkCode.id },
            data: { used_at: new Date() }
        });

        // Create new session for this device
        const { token, session } = await createSession(
            linkCode.user_id,
            deviceType,
            deviceInfo,
            ipAddress
        );

        logger.info(`Link code validated for user ${linkCode.user_id}`);

        return {
            valid: true,
            token,
            session,
            user: {
                id: linkCode.user.id,
                telegram_id: linkCode.user.telegram_id?.toString(),
                username: linkCode.user.username,
                full_name: linkCode.user.full_name,
                role: linkCode.user.role,
                verification_status: linkCode.user.verification_status
            }
        };
    } catch (error) {
        logger.error('Error validating link code:', error);
        return { valid: false, reason: 'Validation error' };
    }
};

/**
 * Cleanup expired sessions and codes
 */
export const cleanupExpiredAuth = async () => {
    try {
        const now = new Date();

        // Deactivate expired sessions
        const sessionsResult = await prisma.authSession.updateMany({
            where: {
                expires_at: { lt: now },
                is_active: true
            },
            data: { is_active: false }
        });

        // Delete old codes (older than 1 hour)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const codesResult = await prisma.authLinkCode.deleteMany({
            where: {
                OR: [
                    { expires_at: { lt: oneHourAgo } },
                    { used_at: { lt: oneHourAgo } }
                ]
            }
        });

        if (sessionsResult.count > 0 || codesResult.count > 0) {
            logger.info(`Auth cleanup: ${sessionsResult.count} sessions expired, ${codesResult.count} codes deleted`);
        }

        return {
            sessions_expired: sessionsResult.count,
            codes_deleted: codesResult.count
        };
    } catch (error) {
        logger.error('Error during auth cleanup:', error);
        throw error;
    }
};

export default {
    createSession,
    validateSession,
    revokeSession,
    revokeAllSessions,
    getUserSessions,
    generateLinkCode,
    validateLinkCode,
    cleanupExpiredAuth
};
