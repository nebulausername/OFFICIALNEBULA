import { verifyToken } from '../config/jwt.js';
import { getInsForgeClient } from '../config/insforge.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    try {
      // 1. Try Local JWT
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (jwtError) {
      // 2. Try InsForge JWT
      const insforge = getInsForgeClient();
      if (insforge) {
        const { data: { user }, error } = await insforge.auth.getUser(token);

        if (user && !error) {
          // Map InsForge user to local user structure
          // Note: You might need to check if user exists in local DB or sync
          req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
            ...user.user_metadata
          };
          return next();
        }
      }

      throw jwtError; // Re-throw if both fail
    }

  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

