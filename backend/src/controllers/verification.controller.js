import prisma from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get random hand gesture from predefined set
const HAND_GESTURES = [
  '👍', // Daumen hoch
  '✌️', // Peace/Victory
  '👌', // OK
  '🤞', // Crossed Fingers
  '🤙', // Call me
  '👈', // Point left
  '👉', // Point right
  '👆', // Point up
  '👇', // Point down
  '✊', // Fist
  '🤝', // Handshake
  '🙌', // Raised hands
];

export const getRandomHandGesture = () => {
  return HAND_GESTURES[Math.floor(Math.random() * HAND_GESTURES.length)];
};

// Submit photo verification (legacy endpoint - kept for compatibility)
export const submitVerification = async (req, res, next) => {
  try {
    const { telegram_id, photo_url } = req.body;

    if (!telegram_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Telegram ID is required',
      });
    }

    if (!photo_url) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Photo URL is required',
      });
    }

    // Find user by telegram_id
    const user = await prisma.user.findUnique({
      where: { telegram_id: BigInt(telegram_id) },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Check if there's a pending verification request
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        user_id: user.id,
        status: 'pending',
      },
      orderBy: { submitted_at: 'desc' },
    });

    if (!existingRequest) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No pending verification request found',
      });
    }

    // Update verification request with photo
    const updatedRequest = await prisma.verificationRequest.update({
      where: { id: existingRequest.id },
      data: {
        photo_url: photo_url,
      },
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_submitted_at: new Date(),
      },
    });

    res.json({
      message: 'Verification photo submitted successfully',
      request: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get verification status
export const getVerificationStatus = async (req, res, next) => {
  try {
    const { telegram_id } = req.query;

    if (!telegram_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Telegram ID is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { telegram_id: BigInt(telegram_id) },
      include: {
        verification_requests: {
          orderBy: { submitted_at: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const latestRequest = user.verification_requests[0] || null;

    res.json({
      verification_status: user.verification_status,
      verification_hand_gesture: user.verification_hand_gesture,
      verification_submitted_at: user.verification_submitted_at,
      verified_at: user.verified_at,
      rejection_reason: user.rejection_reason,
      latest_request: latestRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get all pending verifications (Admin only)
export const getPendingVerifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      prisma.verificationRequest.findMany({
        where: { status: 'pending' },
        include: {
          user: {
            select: {
              id: true,
              telegram_id: true,
              username: true,
              full_name: true,
              email: true,
              phone: true,
              created_at: true,
            },
          },
        },
        orderBy: { submitted_at: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.verificationRequest.count({
        where: { status: 'pending' },
      }),
    ]);

    res.json({
      data: requests.map(req => ({
        ...req,
        user: {
          ...req.user,
          telegram_id: req.user.telegram_id?.toString(),
        },
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Approve verification (Admin only)
export const approveVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verificationRequest) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Verification request not found',
      });
    }

    if (verificationRequest.status !== 'pending') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Verification request is not pending',
      });
    }

    // Update verification request
    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'approved',
        reviewed_at: new Date(),
        reviewed_by: req.user.id,
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: verificationRequest.user_id },
      data: {
        verification_status: 'verified',
        verified_at: new Date(),
        verified_by: req.user.id,
        rejection_reason: null,
      },
    });

    res.json({
      message: 'Verification approved successfully',
      user: {
        ...verificationRequest.user,
        telegram_id: verificationRequest.user.telegram_id?.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reject verification (Admin only)
export const rejectVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Rejection reason is required',
      });
    }

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verificationRequest) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Verification request not found',
      });
    }

    if (verificationRequest.status !== 'pending') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Verification request is not pending',
      });
    }

    // Update verification request
    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewed_at: new Date(),
        reviewed_by: req.user.id,
        rejection_reason: reason,
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: verificationRequest.user_id },
      data: {
        verification_status: 'rejected',
        rejection_reason: reason,
      },
    });

    res.json({
      message: 'Verification rejected successfully',
      user: {
        ...verificationRequest.user,
        telegram_id: verificationRequest.user.telegram_id?.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create verification request (for /start command)
export const createVerificationRequest = async (telegramId) => {
  try {
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegram_id: BigInt(telegramId) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegram_id: BigInt(telegramId),
          role: 'user',
          verification_status: 'pending',
        },
      });
    }

    // Check if there's already a pending request
    const existingPending = await prisma.verificationRequest.findFirst({
      where: {
        user_id: user.id,
        status: 'pending',
      },
    });

    if (existingPending) {
      return {
        user,
        request: existingPending,
        isNew: false,
      };
    }

    // Generate random hand gesture
    const handGesture = getRandomHandGesture();

    // Create new verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        user_id: user.id,
        hand_gesture: handGesture,
        status: 'pending',
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_hand_gesture: handGesture,
        verification_status: 'pending',
      },
    });

    return {
      user,
      request: verificationRequest,
      isNew: true,
    };
  } catch (error) {
    console.error('Error creating verification request:', error);
    throw error;
  }
};

// Download photo from Telegram and save locally
export const downloadTelegramPhoto = async (bot, fileId) => {
  try {
    // Get file info from Telegram
    const file = await bot.getFile(fileId);
    const filePath = file.file_path;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads/verifications');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const localPath = path.join(uploadsDir, filename);

    // Download file from Telegram
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download photo: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buffer));

    // Return relative path for URL
    const relativePath = `/uploads/verifications/${filename}`;
    return relativePath;
  } catch (error) {
    console.error('Error downloading Telegram photo:', error);
    throw error;
  }
};
