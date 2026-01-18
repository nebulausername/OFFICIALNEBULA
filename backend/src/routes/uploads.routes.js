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

export default router;

