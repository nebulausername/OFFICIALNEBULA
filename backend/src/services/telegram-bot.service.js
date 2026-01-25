import TelegramBot from 'node-telegram-bot-api';
import prisma from '../config/database.js';
import { generateToken } from '../config/jwt.js';
import { createVerificationRequest, downloadTelegramPhoto } from '../controllers/verification.controller.js';
import { sendTelegramMessage } from './telegram.service.js';
import { botLogger } from '../utils/botLogger.js';
import { checkRateLimit, getRemainingCommands } from '../middleware/botRateLimit.js';
import { sendMessageWithRetry, editMessageTextWithRetry, answerCallbackQueryWithRetry } from '../utils/telegramRetry.js';
import { notifyUser } from './socket.service.js';

let bot = null;

// State management for admin rejection
const adminRejectionStates = new Map(); // adminId -> { verificationId, timestamp, chatId }

// Admin list cache (5 minutes TTL)
let adminListCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
};

// Get cached admin list or fetch from database
const getAdminList = async () => {
  const now = Date.now();

  // Return cached data if still valid
  if (adminListCache.data && (now - adminListCache.timestamp) < adminListCache.ttl) {
    botLogger.debug('Using cached admin list');
    return adminListCache.data;
  }

  // Fetch from database
  botLogger.debug('Fetching admin list from database');
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['admin', 'staff'] },
      telegram_id: { not: null },
    },
    select: {
      id: true,
      telegram_id: true,
      username: true,
      full_name: true,
      role: true,
    },
  });

  // Update cache
  adminListCache.data = admins;
  adminListCache.timestamp = now;

  return admins;
};

// Cleanup old rejection states (older than 5 minutes)
const cleanupRejectionStates = () => {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes

  for (const [adminId, state] of adminRejectionStates.entries()) {
    if (now - state.timestamp > timeout) {
      adminRejectionStates.delete(adminId);
      botLogger.debug(`Cleaned up expired rejection state for admin ${adminId}`);
    }
  }
};

// NOTE:
// Avoid background timers (setInterval) because this module also runs on Vercel
// serverless where long-lived timers can keep the event loop alive.
// We call cleanup opportunistically in handlers instead.

// Validation functions for Telegram messages
const validateTelegramMessage = (msg) => {
  if (!msg || !msg.from || !msg.chat) {
    botLogger.warn('Invalid message: missing required fields');
    return false;
  }

  if (!msg.from.id || typeof msg.from.id !== 'number') {
    botLogger.warn('Invalid message: invalid user ID');
    return false;
  }

  if (!msg.chat.id || typeof msg.chat.id !== 'number') {
    botLogger.warn('Invalid message: invalid chat ID');
    return false;
  }

  return true;
};

const validateCallbackQuery = (query) => {
  if (!query || !query.from || !query.message) {
    botLogger.warn('Invalid callback query: missing required fields');
    return false;
  }

  if (!query.from.id || typeof query.from.id !== 'number') {
    botLogger.warn('Invalid callback query: invalid user ID');
    return false;
  }

  if (!query.data || typeof query.data !== 'string') {
    botLogger.warn('Invalid callback query: missing or invalid data');
    return false;
  }

  // Validate callback data length (Telegram limit is 64 bytes)
  if (query.data.length > 64) {
    botLogger.warn('Invalid callback query: data too long');
    return false;
  }

  return true;
};

const validateTextMessage = (msg) => {
  if (!validateTelegramMessage(msg)) {
    return false;
  }

  if (!msg.text || typeof msg.text !== 'string') {
    return false; // Not a text message, but that's okay
  }

  // Validate text length (Telegram limit is 4096 characters)
  if (msg.text.length > 4096) {
    botLogger.warn('Invalid text message: text too long');
    return false;
  }

  return true;
};

// Initialize bot
export const initializeBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    botLogger.warn('TELEGRAM_BOT_TOKEN not set - Bot will not be initialized');
    return null;
  }

  try {
    botLogger.info('Creating Telegram Bot instance...');

    // Determine if we should use webhook or polling
    const useWebhook = process.env.NODE_ENV === 'production' || process.env.USE_WEBHOOK === 'true';

    if (useWebhook) {
      // Webhook mode for production (Vercel)
      botLogger.info('Initializing bot in webhook mode');
      bot = new TelegramBot(token, { webHook: false });
      botLogger.info('Telegram Bot instance created (webhook mode)');
    } else {
      // Polling mode for local development
      botLogger.info('Initializing bot in polling mode');
      bot = new TelegramBot(token, { polling: true });
      botLogger.info('Telegram Bot instance created (polling mode)');
    }

    setupBotHandlers();
    botLogger.info('Telegram Bot handlers setup complete');

    // Test bot connection
    bot.getMe().then((botInfo) => {
      botLogger.info(`Bot connected as @${botInfo.username} (${botInfo.first_name})`);
    }).catch((err) => {
      botLogger.error('Error getting bot info:', err);
    });

    return bot;
  } catch (error) {
    botLogger.error('Error initializing Telegram Bot:', error);
    return null;
  }
};

// Setup webhook URL with Telegram
export const setupWebhook = async (webhookUrl) => {
  if (!bot) {
    botLogger.error('Bot not initialized, cannot setup webhook');
    return false;
  }

  try {
    botLogger.info(`Setting up webhook: ${webhookUrl}`);

    // Set webhook
    await bot.setWebHook(webhookUrl);

    // Verify webhook
    const webhookInfo = await bot.getWebHookInfo();
    botLogger.info('Webhook info:', {
      url: webhookInfo.url,
      has_custom_certificate: webhookInfo.has_custom_certificate,
      pending_update_count: webhookInfo.pending_update_count,
    });

    if (webhookInfo.url === webhookUrl) {
      botLogger.info('Webhook setup successful');
      return true;
    } else {
      botLogger.warn('Webhook URL mismatch');
      return false;
    }
  } catch (error) {
    botLogger.error('Error setting up webhook:', error);
    return false;
  }
};

// Handle webhook update from Telegram
export const handleWebhookUpdate = async (update) => {
  if (!bot) {
    botLogger.error('Bot not initialized, cannot handle webhook update');
    return;
  }

  try {
    botLogger.debug('Received webhook update:', update.update_id);

    // Process update through bot instance
    // The bot instance will automatically route to registered handlers
    await bot.processUpdate(update);

    botLogger.debug(`Processed webhook update ${update.update_id}`);
  } catch (error) {
    botLogger.error('Error processing webhook update:', error);
    throw error;
  }
};

// Setup bot command and message handlers
const setupBotHandlers = () => {
  if (!bot) return;

  // /start command
  bot.onText(/\/start/, async (msg) => {
    cleanupRejectionStates();

    // Validate message
    if (!validateTelegramMessage(msg)) {
      return;
    }

    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || msg.from.first_name || 'User';

    // Check rate limit
    if (checkRateLimit(telegramId, 5)) {
      const remaining = getRemainingCommands(telegramId, 5);
      await sendMessageWithRetry(
        bot,
        chatId,
        `⏱️ *Rate Limit erreicht*\n\n` +
        `Du hast zu viele Anfragen gesendet. Bitte warte einen Moment.\n\n` +
        `Verbleibende Anfragen: ${remaining}`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    botLogger.info(`/start command received from ${username} (${telegramId})`);

    try {
      // Create or get verification request
      const { user, request, isNew } = await createVerificationRequest(telegramId);
      botLogger.info(`Verification request processed for ${username}: isNew=${isNew}, status=${user.verification_status}`);

      if (!isNew && user.verification_status === 'verified') {
        // User already verified - show WebView button
        await sendWelcomeMessageVerified(chatId, user);
      } else if (!isNew && user.verification_status === 'pending') {
        // User has pending verification
        await sendPendingVerificationMessage(chatId, request);
      } else {
        // New verification request
        await sendWelcomeMessage(chatId, request, username);
      }
    } catch (error) {
      botLogger.error('Error handling /start command:', error);
      try {
        await sendMessageWithRetry(bot, chatId, '❌ Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      } catch (sendError) {
        botLogger.error('Error sending error message:', sendError);
      }
    }
  });

  botLogger.info('/start command handler registered');

  // /shop command - Browse products
  bot.onText(/\/shop/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { telegram_id: BigInt(telegramId) },
      });

      if (!user || user.verification_status !== 'verified') {
        await sendMessageWithRetry(
          bot,
          chatId,
          '⚠️ *Nicht verifiziert*\n\nBitte verifiziere dich erst mit /start um den Shop zu nutzen!',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Get categories with products
      const products = await prisma.product.findMany({
        where: { in_stock: true },
        include: { category: true },
        distinct: ['category_id'],
      });

      if (products.length === 0) {
        await sendMessageWithRetry(
          bot,
          chatId,
          '🚧 *Shop kommt bald!*\n\nDer Shop wird gerade vorbereitet. Schau später nochmal vorbei!',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Get unique categories
      const categories = [...new Map(products.map(p => p.category).filter(c => c).map(c => [c.id, c])).values()];

      const keyboard = categories.map(cat => [{
        text: `🏷️ ${cat.name}`,
        callback_data: `shop_cat_${cat.id}`,
      }]);

      await sendMessageWithRetry(
        bot,
        chatId,
        '🛍️ *NEBULA SUPPLY*\n\nWähle eine Kategorie:',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: keyboard,
          },
        }
      );
    } catch (error) {
      botLogger.error('Error in /shop command:', error);
      await sendMessageWithRetry(bot, chatId, '❌ Fehler beim Laden des Shops');
    }
  });

  botLogger.info('/shop command handler registered');

  // /cart command - View shopping cart
  bot.onText(/\/cart/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
      const user = await prisma.user.findUnique({
        where: { telegram_id: BigInt(telegramId) },
        include: {
          cart_items: {
            include: { product: true },
          },
        },
      });

      if (!user) {
        await sendMessageWithRetry(bot, chatId, '❌ User nicht gefunden');
        return;
      }

      if (user.cart_items.length === 0) {
        await sendMessageWithRetry(
          bot,
          chatId,
          '🛒 *Dein Warenkorb ist leer!*\n\nNutze /shop um Produkte hinzuzufügen.',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      let message = '🛒 *DEIN WARENKORB*\n\n';
      let total = 0;

      user.cart_items.forEach((item, index) => {
        const price = parseFloat(item.product.price);
        const subtotal = price * item.quantity;
        total += subtotal;
        message += `${index + 1}. *${item.product.name}*\n`;
        message += `   ${item.quantity}x €${price.toFixed(2)} = €${subtotal.toFixed(2)}\n\n`;
      });

      message += `\n💰 *Gesamt: €${total.toFixed(2)}*`;

      await sendMessageWithRetry(
        bot,
        chatId,
        message,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Zur Kasse', callback_data: 'checkout_start' }],
              [{ text: '🗑️ Warenkorb leeren', callback_data: 'cart_clear' }],
              [{ text: '🛍️ Weiter shoppen', callback_data: 'back_to_shop' }],
            ],
          },
        }
      );
    } catch (error) {
      botLogger.error('Error in /cart command:', error);
      await sendMessageWithRetry(bot, chatId, '❌ Fehler beim Laden des Warenkorbs');
    }
  });

  botLogger.info('/cart command handler registered');

  // Handle photo messages for verification
  bot.on('photo', async (msg) => {
    // Validate message
    if (!validateTelegramMessage(msg)) {
      return;
    }

    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const photo = msg.photo;

    if (!photo || photo.length === 0) {
      return;
    }

    // Skip if it's a command reply or not related to verification
    if (msg.text?.startsWith('/')) {
      return;
    }

    try {
      botLogger.info(`Photo received from ${telegramId}`);

      // Find user
      const user = await prisma.user.findUnique({
        where: { telegram_id: BigInt(telegramId) },
        include: {
          verification_requests: {
            where: { status: 'pending' },
            orderBy: { submitted_at: 'desc' },
            take: 1,
          },
        },
      });

      if (!user || user.verification_requests.length === 0) {
        await sendMessageWithRetry(
          bot,
          chatId,
          '⚠️ *Keine offene Verifizierung gefunden*\n\nBitte starte mit /start um eine neue Verifizierung zu beginnen.',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const verificationRequest = user.verification_requests[0];

      // Get the largest photo (last in array)
      const largestPhoto = photo[photo.length - 1];
      const fileId = largestPhoto.file_id;

      // Download and save photo
      let photoUrl;
      try {
        photoUrl = await downloadTelegramPhoto(bot, fileId);
        botLogger.info(`Photo downloaded and saved: ${photoUrl}`);
      } catch (downloadError) {
        botLogger.error('Error downloading photo:', downloadError);
        await sendMessageWithRetry(
          bot,
          chatId,
          '❌ Fehler beim Speichern des Fotos. Bitte versuche es erneut.',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Update verification request with photo
      await prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: {
          photo_url: photoUrl,
        },
      });

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verification_submitted_at: new Date(),
        },
      });

      // Notify admins with updated request (includes photo_url)
      const updatedRequest = await prisma.verificationRequest.findUnique({
        where: { id: verificationRequest.id },
      });
      await notifyAdminsOfNewVerification(user, updatedRequest);

      // Send confirmation to user
      await sendMessageWithRetry(
        bot,
        chatId,
        `✅ *Foto erfolgreich erhalten!*\n\n` +
        `📋 *Status:* Warte auf Admin-Approval\n` +
        `✋ *Handzeichen:* ${verificationRequest.hand_gesture}\n` +
        `⏱️ Wir prüfen deine Verifizierung schnellstmöglich.\n\n` +
        `Du wirst benachrichtigt, sobald deine Verifizierung bestätigt wurde.`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      botLogger.error('Error handling photo:', error);
      try {
        await sendMessageWithRetry(
          bot,
          chatId,
          '❌ Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
          { parse_mode: 'Markdown' }
        );
      } catch (sendError) {
        botLogger.error('Error sending error message:', sendError);
      }
    }
  });

  botLogger.info('Photo handler registered');

  // Handle callback queries (for admin actions)
  bot.on('callback_query', async (query) => {
    cleanupRejectionStates();

    // Validate callback query
    if (!validateCallbackQuery(query)) {
      return;
    }

    const chatId = query.message.chat.id;
    const data = query.data;
    const adminId = query.from.id.toString();

    try {
      // Check if user is admin (optimized query with select)
      const admin = await prisma.user.findFirst({
        where: {
          telegram_id: BigInt(adminId),
          role: { in: ['admin', 'staff'] },
        },
        select: {
          id: true,
          telegram_id: true,
          username: true,
          full_name: true,
          role: true,
        },
      });

      if (!admin) {
        await answerCallbackQueryWithRetry(bot, query.id, {
          text: '❌ Du hast keine Berechtigung für diese Aktion',
          show_alert: true,
        });
        return;
      }

      // Parse callback data: approve_<verification_id> or reject_<verification_id>
      if (data.startsWith('approve_')) {
        const verificationId = data.replace('approve_', '');
        await handleAdminApproval(query, verificationId, admin);
      } else if (data.startsWith('reject_')) {
        const verificationId = data.replace('reject_', '');
        await handleAdminRejection(query, verificationId, admin);
      } else if (data === 'view_cart') {
        await handleViewCart(query, admin);
      } else if (data === 'view_orders') {
        await handleViewOrders(query, admin);
      } else if (data === 'view_vip') {
        await handleViewVIP(query, admin);
      } else if (data === 'view_support') {
        await handleViewSupport(query, admin);
      }

      await answerCallbackQueryWithRetry(bot, query.id);
    } catch (error) {
      botLogger.error('Error handling callback query:', error);
      await answerCallbackQueryWithRetry(bot, query.id, {
        text: '❌ Fehler beim Verarbeiten',
        show_alert: true,
      });
    }
  });

  // Handle text messages (for admin rejection reasons and /cancel command)
  bot.on('message', async (msg) => {
    // Skip if it's a photo, command, or callback query
    if (msg.photo || msg.text?.startsWith('/') || !msg.text) {
      return;
    }

    // Validate text message
    if (!validateTextMessage(msg)) {
      return;
    }

    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const text = msg.text.trim();

    try {
      // Check if user is admin
      const admin = await prisma.user.findFirst({
        where: {
          telegram_id: BigInt(telegramId),
          role: { in: ['admin', 'staff'] },
        },
        select: {
          id: true,
          telegram_id: true,
          role: true,
        },
      });

      if (!admin) {
        // Not an admin, ignore text messages
        return;
      }

      // Handle /cancel command
      if (text === '/cancel') {
        const adminId = admin.id;
        const state = adminRejectionStates.get(adminId);

        if (state) {
          adminRejectionStates.delete(adminId);
          await sendMessageWithRetry(
            bot,
            chatId,
            '✅ *Abgebrochen*\n\nDer Ablehnungsprozess wurde abgebrochen.',
            { parse_mode: 'Markdown' }
          );
          botLogger.info(`Admin ${adminId} cancelled rejection process`);
        } else {
          await sendMessageWithRetry(
            bot,
            chatId,
            'ℹ️ Es gibt keinen aktiven Ablehnungsprozess zum Abbrechen.',
            { parse_mode: 'Markdown' }
          );
        }
        return;
      }

      // Try to process as rejection reason
      const processed = await processRejectionReason(msg, admin);
      if (!processed) {
        // Not a rejection reason, ignore
        return;
      }
    } catch (error) {
      botLogger.error('Error handling text message:', error);
      try {
        await sendMessageWithRetry(
          bot,
          chatId,
          '❌ Es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
          { parse_mode: 'Markdown' }
        );
      } catch (sendError) {
        botLogger.error('Error sending error message:', sendError);
      }
    }
  });

  botLogger.info('Text message handler registered');

  botLogger.info('✅ All bot handlers registered');
};

// Send welcome message with hand gesture challenge
const sendWelcomeMessage = async (chatId, verificationRequest, username) => {
  const handGesture = verificationRequest.hand_gesture;
  const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';

  const message = `🌟 *Willkommen bei NEBULA SUPPLY* 🌟

Hallo ${username}! 👋

*Verifizierungsprozess:*

✋ *Schritt 1: Handzeichen machen*
Mache das Handzeichen *${handGesture}* mit deiner Hand.

📸 *Schritt 2: Foto aufnehmen*
Mache ein klares Foto von dir, auf dem:
• Dein Gesicht vollständig und klar erkennbar ist
• Du das Handzeichen *${handGesture}* mit deiner Hand machst
• Das Handzeichen deutlich sichtbar ist

✅ *Schritt 3: Foto senden*
Sende das Foto direkt als Antwort auf diese Nachricht.

⚡ *Schritt 4: Prüfung*
Wir prüfen deine Verifizierung schnellstmöglich.

*Nach erfolgreicher Verifizierung:*
✨ Vollständiger Shop-Zugang
🛒 Bestellungen aufgeben
👑 VIP-Mitgliedschaft
💎 Exklusive Angebote

*Bitte beachte:*
🔒 Deine Daten werden sicher und vertraulich behandelt
📋 Das Foto wird nur für die Verifizierung verwendet
👤 Dein Gesicht muss klar erkennbar sein
✋ Das Handzeichen muss deutlich sichtbar sein

*Sende jetzt dein Foto mit dem Handzeichen ${handGesture}* 📸`;

  await sendMessageWithRetry(bot, chatId, message, {
    parse_mode: 'Markdown',
  });
};

// Send message for pending verification
const sendPendingVerificationMessage = async (chatId, verificationRequest) => {
  const handGesture = verificationRequest.hand_gesture;
  const hasPhoto = !!verificationRequest.photo_url;

  const message = `⏳ *Verifizierung läuft*

Du hast bereits eine Verifizierung eingereicht.

📋 *Status:* Warte auf Admin-Approval
✋ *Handzeichen:* ${handGesture}
📸 *Foto:* ${hasPhoto ? 'Gesendet ✅' : 'Noch nicht gesendet'}

${hasPhoto
      ? 'Wir prüfen deine Verifizierung schnellstmöglich. Du wirst benachrichtigt, sobald sie bestätigt wurde.'
      : 'Bitte sende noch dein Foto mit dem Handzeichen ' + handGesture + ' 📸'
    }`;

  await sendMessageWithRetry(bot, chatId, message, {
    parse_mode: 'Markdown',
  });
};

// Get WebApp URL with fallback
const getWebAppUrl = () => {
  return process.env.WEBAPP_URL || 'https://officialnebula.vercel.app';
};

// Send welcome message for verified users
const sendWelcomeMessageVerified = async (chatId, user) => {
  const webAppUrl = getWebAppUrl();
  const token = generateToken({
    id: user.id,
    telegram_id: user.telegram_id?.toString(),
    role: user.role,
  });

  const message = `✅ *Willkommen zurück!*

Du bist bereits verifiziert und kannst jetzt den vollständigen Shop nutzen! 🎉

*Was möchtest du tun?*`;

  await sendMessageWithRetry(bot, chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🛍️ Shop öffnen',
            web_app: { url: `${webAppUrl}/?token=${token}` },
          },
        ],
        [
          {
            text: '🛒 Warenkorb',
            callback_data: 'view_cart',
          },
          {
            text: '📦 Bestellungen',
            callback_data: 'view_orders',
          },
        ],
        [
          {
            text: '👑 VIP werden',
            callback_data: 'view_vip',
          },
          {
            text: '💬 Support',
            callback_data: 'view_support',
          },
        ],
      ],
    },
  });
};

// Notify admins of new verification request
const notifyAdminsOfNewVerification = async (user, verificationRequest) => {
  try {
    // Use cached admin list for better performance
    const admins = await getAdminList();

    if (admins.length === 0) {
      botLogger.warn('No admins found to notify about verification request');
      return;
    }

    const webAppUrl = getWebAppUrl();
    const adminPanelUrl = `${webAppUrl}/AdminVerifications`;

    let message = `🔔 *Neue Verifizierungsanfrage*

👤 *User:*
• Name: ${user.full_name || user.username || 'Unbekannt'}
• Telegram: @${user.username || user.telegram_id?.toString()}
• ID: ${user.id.slice(0, 8)}...

✋ *Handzeichen:* ${verificationRequest.hand_gesture}
📸 *Foto:* ${verificationRequest.photo_url ? 'Gesendet ✅' : 'Noch nicht gesendet'}

*Status:* ⏳ Pending

${verificationRequest.photo_url ? '📋 Bitte prüfe das Foto:\n• Gesicht klar erkennbar?\n• Handzeichen sichtbar?' : '⏳ Warte auf Foto...'}`;

    // Build inline keyboard
    const inlineKeyboard = [
      [
        {
          text: '✅ Approve',
          callback_data: `approve_${verificationRequest.id}`,
        },
        {
          text: '❌ Reject',
          callback_data: `reject_${verificationRequest.id}`,
        },
      ],
    ];

    // Add photo preview link if photo exists
    if (verificationRequest.photo_url) {
      const photoUrl = `${webAppUrl}${verificationRequest.photo_url}`;
      inlineKeyboard.push([
        {
          text: '📸 Foto anzeigen',
          url: photoUrl,
        },
      ]);
    }

    // Add admin panel link
    inlineKeyboard.push([
      {
        text: '📋 Admin Panel',
        url: adminPanelUrl,
      },
    ]);

    // Send notifications to all admins with retry
    const notificationPromises = admins
      .filter(admin => admin.telegram_id)
      .map(async (admin) => {
        try {
          await sendMessageWithRetry(
            bot,
            admin.telegram_id.toString(),
            message,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: inlineKeyboard,
              },
            }
          );
          botLogger.info(`Notification sent to admin ${admin.id}`);
        } catch (error) {
          botLogger.error(`Failed to notify admin ${admin.id}:`, error);
        }
      });

    // Wait for all notifications (don't fail if some fail)
    await Promise.allSettled(notificationPromises);

    botLogger.info(`Sent verification notification to ${admins.length} admin(s)`);
  } catch (error) {
    botLogger.error('Error notifying admins:', error);
  }
};

// Handle admin approval
const handleAdminApproval = async (query, verificationId, admin) => {
  try {
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: verificationId },
      include: { user: true },
    });

    if (!verificationRequest || verificationRequest.status !== 'pending') {
      await answerCallbackQueryWithRetry(bot, query.id, {
        text: '❌ Verifizierung nicht gefunden oder bereits bearbeitet',
        show_alert: true,
      });
      return;
    }

    // Update verification request
    await prisma.verificationRequest.update({
      where: { id: verificationId },
      data: {
        status: 'approved',
        reviewed_at: new Date(),
        reviewed_by: admin.id,
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: verificationRequest.user_id },
      data: {
        verification_status: 'verified',
        verified_at: new Date(),
        verified_by: admin.id,
        rejection_reason: null,
      },
    });

    // Generate token for user
    const token = generateToken({
      id: verificationRequest.user.id,
      telegram_id: verificationRequest.user.telegram_id?.toString(),
      role: verificationRequest.user.role,
    });

    const webAppUrl = getWebAppUrl();

    // Notify user
    if (verificationRequest.user.telegram_id) {
      await sendMessageWithRetry(
        bot,
        verificationRequest.user.telegram_id.toString(),
        `🎉 *Verifizierung erfolgreich!*\n\n` +
        `✅ Deine Verifizierung wurde bestätigt.\n\n` +
        `Du kannst jetzt den vollständigen Shop nutzen! 🛍️`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🛍️ Shop öffnen',
                  web_app: { url: `${webAppUrl}/?token=${token}` },
                },
              ],
            ],
          },
        }
      );
    }

    // 📡 Emit Realtime Event to Frontend
    notifyUser(verificationRequest.user.id, 'verification_approved', {
      status: 'verified',
      userId: verificationRequest.user.id
    });

    // Update admin message
    await editMessageTextWithRetry(
      bot,
      query.message.chat.id,
      query.message.message_id,
      `✅ *Verifizierung genehmigt*\n\n` +
      `👤 User: ${verificationRequest.user.full_name || verificationRequest.user.username || 'Unbekannt'}\n` +
      `✋ Handzeichen: ${verificationRequest.hand_gesture}\n` +
      `👨‍💼 Genehmigt von: ${admin.full_name || admin.username || 'Admin'}\n` +
      `⏰ ${new Date().toLocaleString('de-DE')}`,
      {
        parse_mode: 'Markdown',
      }
    );
  } catch (error) {
    botLogger.error('Error handling admin approval:', error);
    throw error;
  }
};

// Handle admin rejection
const handleAdminRejection = async (query, verificationId, admin) => {
  try {
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: verificationId },
      include: { user: true },
    });

    if (!verificationRequest || verificationRequest.status !== 'pending') {
      await answerCallbackQueryWithRetry(bot, query.id, {
        text: '❌ Verifizierung nicht gefunden oder bereits bearbeitet',
        show_alert: true,
      });
      return;
    }

    // Store admin state for rejection reason
    const adminId = admin.id;
    adminRejectionStates.set(adminId, {
      verificationId,
      timestamp: Date.now(),
      chatId: query.message.chat.id,
      user: verificationRequest.user,
    });

    // Ask admin for rejection reason
    await answerCallbackQueryWithRetry(bot, query.id, {
      text: 'Bitte gib einen Ablehnungsgrund ein',
      show_alert: false,
    });

    // Send message asking for reason
    await sendMessageWithRetry(
      bot,
      query.message.chat.id,
      `❌ *Verifizierung ablehnen*\n\n` +
      `User: ${verificationRequest.user.full_name || verificationRequest.user.username || 'Unbekannt'}\n\n` +
      `Bitte sende den Ablehnungsgrund als Antwort auf diese Nachricht.\n` +
      `Oder sende /cancel zum Abbrechen.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true,
          selective: true,
        },
      }
    );
  } catch (error) {
    botLogger.error('Error handling admin rejection:', error);
    throw error;
  }
};

// Handle rejection reason message (called from message handler)
const processRejectionReason = async (msg, admin) => {
  const adminId = admin.id;
  const state = adminRejectionStates.get(adminId);

  if (!state) {
    return false; // Not a rejection reason message
  }

  // Check if message is a reply to rejection request
  if (!msg.reply_to_message || !msg.reply_to_message.text?.includes('Verifizierung ablehnen')) {
    return false;
  }

  const rejectionReason = msg.text || 'Kein Grund angegeben';
  const { verificationId, user } = state;

  try {
    // Update verification request
    await prisma.verificationRequest.update({
      where: { id: verificationId },
      data: {
        status: 'rejected',
        reviewed_at: new Date(),
        reviewed_by: adminId,
        rejection_reason: rejectionReason,
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_status: 'rejected',
        rejection_reason: rejectionReason,
      },
    });

    // Notify user
    if (user.telegram_id) {
      await sendMessageWithRetry(
        bot,
        user.telegram_id.toString(),
        `❌ *Verifizierung abgelehnt*\n\n` +
        `Deine Verifizierung wurde leider abgelehnt.\n\n` +
        `*Grund:* ${rejectionReason}\n\n` +
        `Du kannst es mit /start erneut versuchen.`,
        {
          parse_mode: 'Markdown',
        }
      );
    }

    // Confirm to admin
    await sendMessageWithRetry(
      bot,
      state.chatId,
      `✅ *Verifizierung abgelehnt*\n\n` +
      `User: ${user.full_name || user.username || 'Unbekannt'}\n` +
      `Grund: ${rejectionReason}`,
      {
        parse_mode: 'Markdown',
      }
    );

    // Clean up state
    adminRejectionStates.delete(adminId);
    return true;
  } catch (error) {
    botLogger.error('Error processing rejection reason:', error);
    adminRejectionStates.delete(adminId);
    throw error;
  }
};

// Export bot instance
export const getBot = () => bot;

// Handle view cart callback
const handleViewCart = async (query, user) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      await sendMessageWithRetry(
        bot,
        query.message.chat.id,
        '🛒 *Dein Warenkorb ist leer*\n\nFüge Produkte hinzu, um zu bestellen!',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🛍️ Shop öffnen',
                  web_app: { url: `${getWebAppUrl()}/products` },
                },
              ],
            ],
          },
        }
      );
      return;
    }

    let total = 0;
    let message = '🛒 *Dein Warenkorb*\n\n';

    cartItems.forEach((item, index) => {
      const itemTotal = parseFloat(item.product.price) * item.quantity;
      total += itemTotal;
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Menge: ${item.quantity} × ${item.product.price.toFixed(2)}€ = ${itemTotal.toFixed(2)}€\n\n`;
    });

    message += `💰 *Gesamt: ${total.toFixed(2)}€*\n\n`;
    message += `*Was möchtest du tun?*`;

    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    await sendMessageWithRetry(bot, query.message.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🛍️ Shop öffnen',
              web_app: { url: `${getWebAppUrl()}/cart?token=${token}` },
            },
          ],
          [
            {
              text: '✅ Bestellen',
              callback_data: `checkout_${user.id}`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    botLogger.error('Error handling view cart:', error);
    await sendMessageWithRetry(bot, query.message.chat.id, '❌ Fehler beim Laden des Warenkorbs');
  }
};

// Handle view orders callback
const handleViewOrders = async (query, user) => {
  try {
    const orders = await prisma.request.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    if (orders.length === 0) {
      await sendMessageWithRetry(
        bot,
        query.message.chat.id,
        '📦 *Keine Bestellungen*\n\nDu hast noch keine Bestellungen aufgegeben.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let message = '📦 *Deine Bestellungen*\n\n';

    orders.forEach((order, index) => {
      message += `${index + 1}. Bestellung #${order.id.slice(0, 8)}\n`;
      message += `   Summe: ${parseFloat(order.total_sum).toFixed(2)}€\n`;
      message += `   Status: ${order.status}\n`;
      message += `   Datum: ${new Date(order.created_at).toLocaleDateString('de-DE')}\n\n`;
    });

    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    await sendMessageWithRetry(bot, query.message.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📋 Alle Bestellungen anzeigen',
              web_app: { url: `${getWebAppUrl()}/requests?token=${token}` },
            },
          ],
        ],
      },
    });
  } catch (error) {
    botLogger.error('Error handling view orders:', error);
    await sendMessageWithRetry(bot, query.message.chat.id, '❌ Fehler beim Laden der Bestellungen');
  }
};

// Handle view VIP callback
const handleViewVIP = async (query, user) => {
  try {
    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    await sendMessageWithRetry(
      bot,
      query.message.chat.id,
      `👑 *VIP Mitgliedschaft*\n\n` +
      `Werde VIP und erhalte exklusive Vorteile!\n\n` +
      `✨ Early Access zu neuen Produkten\n` +
      `💎 Exklusive Rabatte\n` +
      `⚡ Priority Support\n` +
      `🎁 Spezielle Angebote`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '👑 VIP werden',
                web_app: { url: `${getWebAppUrl()}/vip?token=${token}` },
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    botLogger.error('Error handling view VIP:', error);
  }
};

// Handle view support callback
const handleViewSupport = async (query, user) => {
  try {
    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    await sendMessageWithRetry(
      bot,
      query.message.chat.id,
      `💬 *Support*\n\n` +
      `Wir helfen dir gerne weiter!\n\n` +
      `📧 E-Mail: support@nebulasupply.com\n` +
      `💬 Telegram: @NebulaSupportBot`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '💬 Support öffnen',
                web_app: { url: `${getWebAppUrl()}/support?token=${token}` },
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    botLogger.error('Error handling view support:', error);
  }
};

// Send order notification via bot
export const sendOrderNotificationViaBot = async (order, user) => {
  if (!bot || !user.telegram_id) return;

  try {
    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id?.toString(),
      role: user.role,
    });

    const message = `🛒 *Neue Bestellung erhalten!*

📦 *Bestellung #${order.id.slice(0, 8)}*
💰 *Summe:* ${parseFloat(order.total_sum).toFixed(2)}€
📊 *Status:* ${order.status}

Vielen Dank für deine Bestellung! 🎉`;

    await sendMessageWithRetry(bot, user.telegram_id.toString(), message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📦 Bestellung anzeigen',
              web_app: { url: `${getWebAppUrl()}/requests?token=${token}` },
            },
          ],
        ],
      },
    });
  } catch (error) {
    botLogger.error('Error sending order notification via bot:', error);
  }
};
