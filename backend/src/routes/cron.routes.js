import express from 'express';
import { runCleanup } from '../services/cleanup.service.js';

const router = express.Router();

const isAuthorizedCron = (req) => {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const expected = secret ? `Bearer ${secret}` : null;

  // If a secret is configured, require it.
  if (expected) {
    return authHeader === expected;
  }

  // If no secret configured, do not allow cron execution in production.
  // This prevents accidentally exposing maintenance endpoints.
  return process.env.NODE_ENV !== 'production';
};

router.get('/cleanup', async (req, res) => {
  if (!isAuthorizedCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await runCleanup();
    return res.json({ ok: true, ...result });
  } catch (error) {
    console.error('[CRON] Cleanup failed:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;

