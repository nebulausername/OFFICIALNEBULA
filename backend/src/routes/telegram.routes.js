import express from 'express';
import { handleWebhookUpdate, getBot, initializeBot } from '../services/telegram-bot.service.js';
import { botLogger } from '../utils/botLogger.js';

const router = express.Router();

// Webhook endpoint for Telegram updates
router.post('/webhook', async (req, res) => {
  try {
    // Validate request
    if (!req.body || !req.body.update_id) {
      botLogger.warn('Invalid webhook request: missing update_id');
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Get bot instance (lazy init for serverless)
    let bot = getBot();
    if (!bot) {
      botLogger.info('Bot not initialized yet - initializing lazily for webhook');
      bot = initializeBot();
    }
    if (!bot) {
      botLogger.error('Bot instance not available');
      return res.status(503).json({ error: 'Bot not initialized' });
    }

    // Handle webhook update
    await handleWebhookUpdate(req.body);

    // Respond quickly to Telegram (within 60 seconds)
    res.status(200).json({ ok: true });
  } catch (error) {
    botLogger.error('Error handling webhook update:', error);
    // Still respond 200 to prevent Telegram from retrying
    res.status(200).json({ ok: false, error: error.message });
  }
});

// Health check endpoint for webhook status
router.get('/webhook/status', async (req, res) => {
  try {
    let bot = getBot();
    if (!bot) {
      bot = initializeBot();
    }
    if (!bot) {
      return res.status(503).json({
        status: 'error',
        message: 'Bot not initialized',
      });
    }

    // Try to get bot info
    const botInfo = await bot.getMe();
    
    res.json({
      status: 'ok',
      bot: {
        username: botInfo.username,
        first_name: botInfo.first_name,
        id: botInfo.id,
      },
      webhook: {
        enabled: true,
        mode: 'webhook',
      },
    });
  } catch (error) {
    botLogger.error('Error checking webhook status:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
