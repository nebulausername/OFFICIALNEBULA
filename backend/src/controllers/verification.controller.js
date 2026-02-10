import prisma from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validatePhoto, validatePhotoBuffer } from '../utils/photoValidator.js';
import { uploadVerificationPhoto } from '../services/storage.service.js';

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

    // Notify admins via Socket.io
    try {
      const { getIO } = await import('../services/socket.service.js');
      const io = getIO();
      if (io) {
        io.to('admin').emit('verification:new', {
          id: updatedRequest.id,
          user: {
            id: user.id,
            full_name: user.full_name,
            telegram_id: user.telegram_id?.toString(),
          },
          submitted_at: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to emit socket event:', error);
    }

    res.json({
      message: 'Verification photo submitted successfully',
      request: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Submit photo verification via Browser (Multer upload)
export const submitBrowserVerification = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: 'No photo uploaded' });
    }

    const { hand_gesture, is_simulation } = req.body;
    const user = req.user;

    // Validate photo buffer
    if (!validatePhotoBuffer(req.file.buffer)) {
      return res.status(400).json({ error: 'Invalid Photo', message: 'Photo validation failed' });
    }

    // Upload to InsForge OR Simulation
    let photoUrl = '';

    if (is_simulation === 'true') {
      photoUrl = 'https://placehold.co/600x400/000000/FFF?text=DEMO+SIMULATION';
    } else {
      const fileName = `verifications/${user.id}_${Date.now()}.jpg`;
      const uploadResult = await uploadVerificationPhoto(req.file.buffer, fileName);

      if (!uploadResult) {
        throw new Error('Failed to upload photo to InsForge');
      }
      photoUrl = uploadResult.url;
    }

    // Check existing request
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: { user_id: user.id, status: 'pending' },
    });

    let updatedRequest;
    if (existingRequest) {
      updatedRequest = await prisma.verificationRequest.update({
        where: { id: existingRequest.id },
        data: {
          photo_url: photoUrl,
          hand_gesture: hand_gesture || existingRequest.hand_gesture,
          submitted_at: new Date(),
        },
      });
    } else {
      const gesture = hand_gesture || getRandomHandGesture();
      updatedRequest = await prisma.verificationRequest.create({
        data: {
          user_id: user.id,
          photo_url: photoUrl,
          hand_gesture: gesture,
          status: 'pending',
          submitted_at: new Date(),
        },
      });
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_status: 'pending',
        verification_submitted_at: new Date(),
        rejection_reason: null,
      },
    });

    // Notify admins (Socket)
    try {
      const { getIO } = await import('../services/socket.service.js');
      const io = getIO();
      if (io) {
        io.to('role_admin').emit('verification:new', {
          id: updatedRequest.id,
          user: { id: user.id, full_name: user.full_name, telegram_id: user.telegram_id?.toString() },
          submitted_at: new Date(),
          photo_url: photoUrl
        });
      }
    } catch (e) { console.error('Socket emit failed:', e); }

    res.json({ message: 'Verification photo submitted successfully', request: updatedRequest });
  } catch (error) {
    next(error);
  }
};

// Get verification status
export const getVerificationStatus = async (req, res, next) => {
  try {
    const { telegram_id } = req.query;
    let userId;
    let telegramIdBigInt;

    if (req.user) {
      userId = req.user.id;
    } else if (telegram_id) {
      telegramIdBigInt = BigInt(telegram_id);
    } else {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Telegram ID or Authentication is required',
      });
    }

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { telegram_id: telegramIdBigInt },
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

    // Notify user via Telegram
    try {
      const { default: botService } = await import('../services/telegram-bot.service.js');
      const telegramId = verificationRequest.user.telegram_id;
      if (telegramId) {
        await botService.sendTelegramMessage(
          telegramId.toString(),
          `✅ *Verifizierung erfolgreich!*\n\n` +
          `Willkommen bei Nebula Supply. Dein Account wurde freigeschaltet.\n\n` +
          `Du hast nun vollen Zugriff auf alle Produkte und Preise.\n\n` +
          `Viel Spaß beim Shoppen! 🛍️`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }

    // Emit socket event to admins AND user
    try {
      const { getIO } = await import('../services/socket.service.js');
      const io = getIO();
      if (io) {
        // Notify Admins
        io.to('admin').emit('verification:approved', {
          id: verificationRequest.id,
          user_id: verificationRequest.user_id,
          admin_id: req.user.id
        });

        // Notify User
        io.to(`user:${verificationRequest.user_id}`).emit('verification:updated', {
          status: 'verified',
          title: 'Verifizierung erfolgreich',
          message: 'Dein Account wurde freigeschaltet. Viel Spaß beim Shoppen!'
        });
      }
    } catch (error) {
      console.error('Failed to emit socket event:', error);
    }

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

    // Notify user via Telegram
    try {
      const { default: botService } = await import('../services/telegram-bot.service.js');
      const telegramId = verificationRequest.user.telegram_id;
      if (telegramId) {
        await botService.sendTelegramMessage(
          telegramId.toString(),
          `❌ *Verifizierung abgelehnt*\n\n` +
          `Grund: ${reason}\n\n` +
          `Du kannst einen neuen Versuch starten, indem du /start tippst.`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }

    // Emit socket event to admins AND user
    try {
      const { getIO } = await import('../services/socket.service.js');
      const io = getIO();
      if (io) {
        // Notify Admins
        io.to('admin').emit('verification:rejected', {
          id: verificationRequest.id,
          user_id: verificationRequest.user_id,
          admin_id: req.user.id
        });

        // Notify User
        io.to(`user:${verificationRequest.user_id}`).emit('verification:updated', {
          status: 'rejected',
          title: 'Verifizierung abgelehnt',
          message: `Grund: ${reason}`,
          reason: reason
        });
      }
    } catch (error) {
      console.error('Failed to emit socket event:', error);
    }

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

// Download photo from Telegram and save to InsForge
export const downloadTelegramPhoto = async (bot, fileId) => {
  try {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // Download
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    // Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to InsForge
    const filename = `verifications/tg_${fileId}_${Date.now()}.jpg`;
    const uploadResult = await uploadVerificationPhoto(buffer, filename);

    if (!uploadResult) {
      throw new Error('Upload to InsForge failed');
    }

    return { url: uploadResult.url, buffer };
  } catch (error) {
    console.error('Error downloading/uploading Telegram photo:', error);
    throw error;
  }
};

/**
 * Check verification status by email (Gate Check)
 */
export const checkGateStatus = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Bad Request', message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        verification_status: true,
        verification_submitted_at: true,
        rejection_reason: true
      }
    });

    if (!user) {
      return res.json({ status: 'new' });
    }

    res.json({
      status: user.verification_status,
      submitted_at: user.verification_submitted_at,
      rejection_reason: user.rejection_reason
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register new applicant with photo verification
 */
export const registerApplicant = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: 'No photo uploaded' });
    }

    const { email, hand_gesture, is_simulation } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Bad Request', message: 'Email is required' });
    }

    // Validate photo buffer
    if (!validatePhotoBuffer(req.file.buffer)) {
      return res.status(400).json({ error: 'Invalid Photo', message: 'Photo validation failed' });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // If user exists, check status
      if (user.verification_status === 'verified') {
        return res.status(400).json({ error: 'Already Verified', message: 'User is already verified' });
      }
    } else {
      // Create new user (pending)
      user = await prisma.user.create({
        data: {
          email,
          role: 'user',
          verification_status: 'pending',
          verification_hand_gesture: hand_gesture,
          verification_submitted_at: new Date()
        }
      });
    }

    // Upload to InsForge OR Simulation
    let photoUrl = '';

    if (is_simulation === 'true') {
      photoUrl = 'https://placehold.co/600x400/000000/FFF?text=DEMO+SIMULATION';
    } else {
      const fileName = `verifications/${user.id}_${Date.now()}.jpg`;
      const uploadResult = await uploadVerificationPhoto(req.file.buffer, fileName);

      if (!uploadResult) {
        throw new Error('Failed to upload photo to InsForge');
      }
      photoUrl = uploadResult.url;
    }

    // Check existing request
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: { user_id: user.id, status: 'pending' }
    });

    let request;
    if (existingRequest) {
      request = await prisma.verificationRequest.update({
        where: { id: existingRequest.id },
        data: {
          photo_url: photoUrl,
          hand_gesture: hand_gesture || existingRequest.hand_gesture,
          submitted_at: new Date()
        }
      });
    } else {
      request = await prisma.verificationRequest.create({
        data: {
          user_id: user.id,
          photo_url: photoUrl,
          hand_gesture: hand_gesture || 'N/A',
          status: 'pending',
          submitted_at: new Date()
        }
      });
    }

    // Ensure user status is pending
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_status: 'pending',
        verification_submitted_at: new Date(),
        rejection_reason: null
      }
    });

    // Notify admins (Socket)
    try {
      const { getIO } = await import('../services/socket.service.js');
      const io = getIO();
      if (io) {
        const payload = {
          id: request.id,
          user: { id: user.id, email: user.email, full_name: user.full_name },
          submitted_at: new Date(),
          photo_url: photoUrl
        };
        io.to('role_admin').emit('verification:new', payload);
        io.to('admin').emit('verification:new', payload);
      }
    } catch (e) { console.error('Socket emit failed:', e); }

    res.json({ message: 'Application submitted successfully', status: 'pending' });

  } catch (error) {
    next(error);
  }
};
