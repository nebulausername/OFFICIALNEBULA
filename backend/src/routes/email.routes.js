import express from 'express';
import { sendEmail } from '../services/email.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin); // Only admins can send emails

router.post('/', [
  body('to').isEmail().withMessage('Valid email required'),
  body('subject').trim().notEmpty().withMessage('Subject required'),
  body('body').trim().notEmpty().withMessage('Body required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array(),
      });
    }

    const { to, subject, body, html } = req.body;
    const result = await sendEmail({ to, subject, body, html });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

