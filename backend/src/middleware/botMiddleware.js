/**
 * Middleware system for Telegram Bot command handlers
 */

import { checkRateLimit, getRemainingCommands } from './botRateLimit.js';
import { botLogger } from '../utils/botLogger.js';

/**
 * Wrap bot handler with middleware
 * @param {Function} handler - Bot command handler function
 * @param {Object} options - Middleware options
 * @param {boolean} options.rateLimit - Enable rate limiting (default: true)
 * @param {number} options.maxCommands - Max commands per minute (default: 5)
 * @param {boolean} options.logging - Enable logging (default: true)
 * @returns {Function} Wrapped handler
 */
export const withBotMiddleware = (handler, options = {}) => {
  const {
    rateLimit = true,
    maxCommands = 5,
    logging = true,
  } = options;

  return async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || msg.from.first_name || 'User';
    const command = msg.text?.split(' ')[0] || 'unknown';

    // Logging
    if (logging) {
      botLogger.info(`Command received: ${command} from ${username} (${telegramId})`);
    }

    // Rate limiting
    if (rateLimit) {
      if (checkRateLimit(telegramId, maxCommands)) {
        const remaining = getRemainingCommands(telegramId, maxCommands);
        botLogger.warn(`Rate limit exceeded for ${username} (${telegramId})`);
        
        // Return error message (handler should send it)
        return {
          error: 'RATE_LIMIT',
          message: `⏱️ *Rate Limit erreicht*\n\n` +
                   `Du hast zu viele Anfragen gesendet. Bitte warte einen Moment.\n\n` +
                   `Verbleibende Anfragen: ${remaining}`,
        };
      }
    }

    // Execute handler with error handling
    try {
      const result = await handler(msg, match);
      
      if (logging) {
        botLogger.info(`Command ${command} completed successfully for ${username}`);
      }
      
      return result;
    } catch (error) {
      botLogger.error(`Error in command ${command} from ${username}:`, error);
      
      // Return error (handler should handle it)
      return {
        error: 'HANDLER_ERROR',
        message: error.message || 'Ein Fehler ist aufgetreten',
        originalError: error,
      };
    }
  };
};
