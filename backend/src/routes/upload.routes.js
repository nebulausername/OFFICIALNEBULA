import express from 'express';
import { upload } from '../config/upload.js';
import { saveFile } from '../services/upload.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve uploaded files
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Upload endpoint
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No file uploaded',
      });
    }

    const fileData = await saveFile(req.file);
    
    res.json({
      url: fileData.url,
      file_url: fileData.url, // Alias for compatibility
      path: fileData.path,
      filename: fileData.filename,
      size: fileData.size,
      mimetype: fileData.mimetype,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

