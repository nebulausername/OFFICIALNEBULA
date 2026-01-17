import prisma from '../config/database.js';
import { generateToken } from '../config/jwt.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const login = async (req, res, next) => {
  try {
    const { telegram_id, username, full_name, email, phone } = req.body;

    if (!telegram_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Telegram ID is required',
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegram_id: BigInt(telegram_id) },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          telegram_id: BigInt(telegram_id),
          username: username || null,
          full_name: full_name || null,
          email: email || null,
          phone: phone || null,
          role: 'user',
        },
      });
    } else {
      // Update user info if provided
      const updateData = {};
      if (username) updateData.username = username;
      if (full_name) updateData.full_name = full_name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id?.toString(),
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_vip: user.is_vip,
        vip_expires_at: user.vip_expires_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { telegram_id, username, full_name, email, phone } = req.body;

    if (!telegram_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Telegram ID is required',
      });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { telegram_id: BigInt(telegram_id) },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User already exists',
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        telegram_id: BigInt(telegram_id),
        username: username || null,
        full_name: full_name || null,
        email: email || null,
        phone: phone || null,
        role: 'user',
      },
    });

    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id?.toString(),
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_vip: user.is_vip,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        telegram_id: true,
        username: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_vip: true,
        vip_expires_at: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json({
      ...user,
      telegram_id: user.telegram_id?.toString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { full_name, email, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(full_name && { full_name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        telegram_id: true,
        username: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_vip: true,
        vip_expires_at: true,
      },
    });

    res.json({
      ...user,
      telegram_id: user.telegram_id?.toString(),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  // JWT is stateless, so logout is handled client-side
  // Could implement token blacklist here if needed
  res.json({ message: 'Logged out successfully' });
};

// Telegram WebApp authentication
export const telegramWebAppAuth = async (req, res, next) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Telegram WebApp initData is required',
      });
    }

    // Validate Telegram WebApp signature
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');
      
      const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
      
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
      
      if (hash !== calculatedHash) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid Telegram WebApp signature',
        });
      }
    }

    // Parse Telegram WebApp initData
    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user') || '{}');
    const telegramId = userData.id?.toString();

    if (!telegramId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid Telegram WebApp data',
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegram_id: BigInt(telegramId) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegram_id: BigInt(telegramId),
          username: userData.username || null,
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null,
          role: 'user',
          verification_status: 'pending',
        },
      });
    } else {
      // Update user info
      const updateData = {};
      if (userData.username) updateData.username = userData.username;
      if (userData.first_name || userData.last_name) {
        updateData.full_name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      }

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    // Check verification status
    if (user.verification_status !== 'verified') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User not verified',
        verification_status: user.verification_status,
        verification_hand_gesture: user.verification_hand_gesture,
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id?.toString(),
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_vip: user.is_vip,
        vip_expires_at: user.vip_expires_at,
        verification_status: user.verification_status,
      },
    });
  } catch (error) {
    next(error);
  }
};

