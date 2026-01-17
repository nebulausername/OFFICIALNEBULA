/**
 * Structured logging for Telegram Bot
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL = process.env.BOT_LOG_LEVEL 
  ? LOG_LEVELS[process.env.BOT_LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : LOG_LEVELS.INFO;

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @returns {string} Formatted log message
 */
const formatLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[BOT] [${level}] [${timestamp}] ${message}`;
  
  if (data) {
    return `${logMessage}\n${JSON.stringify(data, null, 2)}`;
  }
  
  return logMessage;
};

/**
 * Bot logger object
 */
export const botLogger = {
  /**
   * Debug log
   */
  debug: (message, data = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(formatLog('DEBUG', message, data));
    }
  },

  /**
   * Info log
   */
  info: (message, data = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      console.log(formatLog('INFO', message, data));
    }
  },

  /**
   * Warning log
   */
  warn: (message, data = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(formatLog('WARN', message, data));
    }
  },

  /**
   * Error log
   */
  error: (message, error = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      const errorData = error ? {
        message: error.message,
        stack: error.stack,
        ...(error.response && { response: error.response }),
      } : null;
      console.error(formatLog('ERROR', message, errorData));
    }
  },
};
