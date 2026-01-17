/**
 * Retry mechanism for Telegram Bot operations with exponential backoff
 */

/**
 * Retry a bot operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise} Result of the operation
 */
export const retryBotOperation = async (operation, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.response?.statusCode === 400 || // Bad Request
          error.response?.statusCode === 403 || // Forbidden
          error.response?.statusCode === 404) {  // Not Found
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      
      console.warn(`[BOT RETRY] Attempt ${attempt + 1}/${maxRetries + 1} failed. Retrying in ${delay}ms...`, error.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Wrapper for sendMessage with retry
 */
export const sendMessageWithRetry = async (bot, chatId, message, options = {}) => {
  return retryBotOperation(
    () => bot.sendMessage(chatId, message, options),
    3,
    1000
  );
};

/**
 * Wrapper for editMessageText with retry
 */
export const editMessageTextWithRetry = async (bot, chatId, messageId, text, options = {}) => {
  return retryBotOperation(
    () => bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options }),
    3,
    1000
  );
};

/**
 * Wrapper for answerCallbackQuery with retry
 */
export const answerCallbackQueryWithRetry = async (bot, queryId, options = {}) => {
  return retryBotOperation(
    () => bot.answerCallbackQuery(queryId, options),
    2, // Fewer retries for callback queries
    500
  );
};

/**
 * Wrapper for getFile with retry
 */
export const getFileWithRetry = async (bot, fileId) => {
  return retryBotOperation(
    () => bot.getFile(fileId),
    3,
    1000
  );
};
