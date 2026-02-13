import { verifyToken } from '../config/jwt.js';
import { getInsForgeClient } from '../config/insforge.js';

export const authenticate = async (req, res, next) => {
  // DEBUG LOGGING
  // console.log(`[AUTH] Checking request: ${req.method} ${req.path}`);

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
      console.warn(`[AUTH] ⚠️ No token provided for ${req.path}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // console.log(`[AUTH] Token found (len=${token.length}), verifying...`);

    // 2. Verify Token (Local JWT or InsForge)
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (jwtError) {
      // 3. Try InsForge JWT
      console.log('Local JWT failed, trying InsForge verification...');
      // console.log('Token snippet:', token.substring(0, 10) + '...');

      try {
        const insforge = getInsForgeClient();
        if (!insforge) {
          console.error('❌ InsForge client not initialized (Check INSFORGE_BASE_URL/API_KEY)');
          throw new Error('InsForge client not initialized');
        }

        const { data, error } = await insforge.auth.getUser(token);

        if (error || !data?.user) {
          console.error('❌ InsForge Auth Failed:', error?.message || 'No user found');
          throw new Error('Invalid token');
        }

        const user = data.user;
        console.log('✅ InsForge Auth Success:', user.email);

        // Map InsForge user
        req.user = {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user',
          ...user.user_metadata
        };
        return next();
      } catch (insforgeError) {
        console.error('❌ All auth methods failed for token:', insforgeError.message);
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

