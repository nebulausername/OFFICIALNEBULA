import express from 'express';
import { createSignedUrl, hasSupabaseStorageConfig } from '../services/supabase-storage.service.js';

const router = express.Router();

const isSafeFilename = (name) => {
  // Prevent path traversal; allow simple filenames only
  return typeof name === 'string' && /^[a-zA-Z0-9._-]+$/.test(name);
};

router.get('/verifications/:filename', async (req, res, next) => {
  if (!hasSupabaseStorageConfig()) {
    // Fall back to local filesystem static serving
    return next();
  }

  const filename = req.params.filename;
  if (!isSafeFilename(filename)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid filename' });
  }

  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'verifications';
    const objectPath = `verifications/${filename}`;
    const signedUrl = await createSignedUrl({
      bucket,
      objectPath,
      expiresIn: 10 * 60, // 10 minutes
    });

    return res.redirect(302, signedUrl);
  } catch (error) {
    // If object missing or signing fails, fallback to local static (dev) or 404
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    return res.status(404).json({ error: 'Not Found', message: 'Photo not found' });
  }
});

// Serve verification photo from DB (fallback)
router.get('/verifications/db/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Import prisma dynamically to avoid circular dependency issues if any
    const { default: prisma } = await import('../config/database.js');

    const request = await prisma.verificationRequest.findUnique({
      where: { id },
      select: { photo_data: true }
    });

    if (!request || !request.photo_data) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Serve image
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    res.send(request.photo_data);
  } catch (error) {
    console.error('Error serving DB image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

