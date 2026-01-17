/**
 * Rate limiting middleware for Telegram Bot commands
 * Limits: 5 commands per minute per user
 */

const userCommandTimestamps = new Map(); // userId -> [timestamp1, timestamp2, ...]

// Cleanup old timestamps (older than 1 minute)
const cleanupOldTimestamps = () => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  for (const [userId, timestamps] of userCommandTimestamps.entries()) {
    const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (recentTimestamps.length === 0) {
      userCommandTimestamps.delete(userId);
    } else {
      userCommandTimestamps.set(userId, recentTimestamps);
    }
  }
};

// Run cleanup every 30 seconds
setInterval(cleanupOldTimestamps, 30 * 1000);

/**
 * Check if user has exceeded rate limit
 * @param {string} userId - Telegram user ID
 * @param {number} maxCommands - Maximum commands per minute (default: 5)
 * @returns {boolean} True if rate limit exceeded
 */
export const checkRateLimit = (userId, maxCommands = 5) => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  // Get user's command timestamps
  let timestamps = userCommandTimestamps.get(userId) || [];
  
  // Filter out timestamps older than 1 minute
  timestamps = timestamps.filter(ts => now - ts < windowMs);
  
  // Check if limit exceeded
  if (timestamps.length >= maxCommands) {
    return true; // Rate limit exceeded
  }
  
  // Add current timestamp
  timestamps.push(now);
  userCommandTimestamps.set(userId, timestamps);
  
  return false; // Within rate limit
};

/**
 * Get remaining commands for user
 * @param {string} userId - Telegram user ID
 * @param {number} maxCommands - Maximum commands per minute (default: 5)
 * @returns {number} Remaining commands
 */
export const getRemainingCommands = (userId, maxCommands = 5) => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  const timestamps = userCommandTimestamps.get(userId) || [];
  const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  return Math.max(0, maxCommands - recentTimestamps.length);
};
