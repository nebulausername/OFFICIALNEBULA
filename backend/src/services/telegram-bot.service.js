import TelegramBot from 'node-telegram-bot-api';
import prisma from '../config/database.js';
import { botLogger } from '../utils/botLogger.js';
import { checkRateLimit, getRemainingCommands } from '../middleware/botRateLimit.js';

// Import Handlers
import { handleStart, handleHelp } from '../bot/handlers/command.handler.js';
import { handleShop, handleCart } from '../bot/handlers/shop.handler.js';
import { handlePhotoMessage } from '../bot/handlers/verification.handler.js';
import { handleCode, handleSessions } from '../bot/handlers/session.handler.js';

let bot = null;
let isInitializing = false;
let handlersInitialized = false;

// Circuit Breaker
const circuitBreaker = {
  failures: 0,
  maxFailures: 5,
  resetTimeout: 60 * 1000,
  lastFailure: 0,
  state: 'closed',

  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.maxFailures) {
      this.state = 'open';
      botLogger.error(`Circuit breaker OPENED after ${this.failures} failures`);
      setTimeout(() => {
        this.state = 'half-open';
        this.failures = 0;
        botLogger.info('Circuit breaker entering HALF-OPEN state');
      }, this.resetTimeout);
    }
  },

  recordSuccess() {
    if (this.state === 'half-open') {
      this.state = 'closed';
      botLogger.info('Circuit breaker CLOSED');
    }
    this.failures = 0;
  },

  isOpen() {
    return this.state === 'open';
  },

  reset() {
    this.failures = 0;
    this.state = 'closed';
  }
};

// Validation Helper (Exported for handlers if needed, though they import it? No I removed export there)
// Actually I should export it or move it to a util. For now, I'll keep it here and handlers validte internally or I export it.
// In my handlers implementation I imported `validateTelegramMessage` from here. So I MUST export it.
export const validateTelegramMessage = (msg) => {
  if (!msg || !msg.from || !msg.chat) return false;
  if (!msg.from.id || typeof msg.from.id !== 'number') return false;
  return true;
};

// Initialize Bot
export const initializeBot = async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    botLogger.warn('TELEGRAM_BOT_TOKEN not set');
    return null;
  }

  if (isInitializing) return bot;
  if (bot && !circuitBreaker.isOpen()) return bot;
  if (circuitBreaker.isOpen()) return null;

  isInitializing = true;

  try {
    if (bot) {
      try {
        await bot.stopPolling({ cancel: true });
        await new Promise(r => setTimeout(r, 1500));
      } catch (e) {
        botLogger.warn('Error stopping previous bot:', e.message);
      }
      bot = null;
    }

    const useWebhook = process.env.NODE_ENV === 'production' || process.env.USE_WEBHOOK === 'true';

    if (useWebhook) {
      botLogger.info('Initializing bot in webhook mode');
      bot = new TelegramBot(token, { webHook: false });
    } else {
      botLogger.info('Initializing bot in polling mode');
      bot = new TelegramBot(token, {
        polling: {
          autoStart: true,
          params: { timeout: 30 }
        }
      });

      bot.on('polling_error', (error) => {
        if (error?.response?.statusCode === 409) return;
        botLogger.error('Polling error:', error);
        circuitBreaker.recordFailure();
      });
    }

    if (!handlersInitialized) {
      setupBotHandlers(bot);
      handlersInitialized = true;
    }

    // Test connection
    try {
      const botInfo = await bot.getMe();
      botLogger.info(`Bot connected as @${botInfo.username}`);
      circuitBreaker.recordSuccess();
    } catch (err) {
      botLogger.error('Error getting bot info:', err);
      circuitBreaker.recordFailure();
    }

    isInitializing = false;
    return bot;
  } catch (error) {
    botLogger.error('Error initializing bot:', error);
    circuitBreaker.recordFailure();
    isInitializing = false;
    return null;
  }
};

// Setup Handlers
const setupBotHandlers = (botInstance) => {
  if (!botInstance) return;

  // Commands
  botInstance.onText(/\/start/, (msg) => handleStart(botInstance, msg));
  botInstance.onText(/\/help/, (msg) => handleHelp(botInstance, msg));
  botInstance.onText(/\/shop/, (msg) => handleShop(botInstance, msg));
  botInstance.onText(/\/cart/, (msg) => handleCart(botInstance, msg));
  botInstance.onText(/\/code/, (msg) => handleCode(botInstance, msg));
  botInstance.onText(/\/sessions/, (msg) => handleSessions(botInstance, msg));

  // Photos (Verification)
  botInstance.on('photo', (msg) => handlePhotoMessage(botInstance, msg));

  botLogger.info('Bot handlers registered via modules');
};

// Export getBot
export const getBot = () => bot;

// Webhook Helpers
export const setupWebhook = async (webhookUrl) => {
  if (!bot) return false;
  try {
    await bot.setWebHook(webhookUrl);
    return true;
  } catch (error) {
    botLogger.error('Error setting webhook:', error);
    return false;
  }
};

export const handleWebhookUpdate = async (update) => {
  if (!bot) return;
  await bot.processUpdate(update);
};
