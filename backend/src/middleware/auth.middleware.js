import { verifyToken } from '../config/jwt.js';
import { getInsForgeClient } from '../config/insforge.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // 0. Try Cookie First (HttpOnly)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 1. Try Header (Bearer)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // 2. Verify Token (Local JWT or InsForge)
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (jwtError) {
      // 3. Try InsForge JWT
      // console.log('Local JWT failed, trying InsForge...', jwtError.message);

      try {
        const insforge = getInsForgeClient();
        if (!insforge) throw new Error('InsForge client not initialized');

        const { data: { user }, error } = await insforge.auth.getUser(token);

        if (error || !user) {
          // console.error('InsForge Auth Failed:', error?.message);
          throw new Error('Invalid token');
        }

        // Map InsForge user
        req.user = {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user',
          ...user.user_metadata
        };
        return next();
      } catch (insforgeError) {
        // console.error('All auth methods failed');
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Server auth error'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

