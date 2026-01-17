import TelegramBot from 'node-telegram-bot-api';
import prisma from '../config/database.js';
import { generateToken } from '../config/jwt.js';
import { createVerificationRequest, downloadTelegramPhoto } from '../controllers/verification.controller.js';
import { sendTelegramMessage } from './telegram.service.js';

let bot = null;

// Initialize bot
export const initializeBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not set - Bot will not be initialized');
    return null;
  }

  try {
    console.log('🤖 Creating Telegram Bot instance...');
    bot = new TelegramBot(token, { polling: true });
    console.log('✅ Telegram Bot instance created');
    
    setupBotHandlers();
    console.log('✅ Telegram Bot handlers setup complete');
    
    // Test bot connection
    bot.getMe().then((botInfo) => {
      console.log(`✅ Bot connected as @${botInfo.username} (${botInfo.first_name})`);
    }).catch((err) => {
      console.error('❌ Error getting bot info:', err.message);
    });
    
    return bot;
  } catch (error) {
    console.error('❌ Error initializing Telegram Bot:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    return null;
  }
};

// Setup bot command and message handlers
const setupBotHandlers = () => {
  if (!bot) return;

  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || msg.from.first_name || 'User';

    console.log(`📨 /start command received from ${username} (${telegramId})`);

    try {
      // Create or get verification request
      const { user, request, isNew } = await createVerificationRequest(telegramId);
      console.log(`✅ Verification request processed for ${username}: isNew=${isNew}, status=${user.verification_status}`);

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
      console.error('❌ Error handling /start command:', error);
      console.error('Stack:', error.stack);
      try {
        await bot.sendMessage(chatId, '❌ Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      } catch (sendError) {
        console.error('❌ Error sending error message:', sendError);
      }
    }
  });
  
  console.log('✅ /start command handler registered');

  // Handle photo messages for verification
  bot.on('photo', async (msg) => {
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
      console.log(`📸 Photo received from ${telegramId}`);

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
        await bot.sendMessage(
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
        console.log(`✅ Photo downloaded and saved: ${photoUrl}`);
      } catch (downloadError) {
        console.error('❌ Error downloading photo:', downloadError);
        await bot.sendMessage(
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
      await bot.sendMessage(
        chatId,
        `✅ *Foto erfolgreich erhalten!*\n\n` +
        `📋 *Status:* Warte auf Admin-Approval\n` +
        `✋ *Handzeichen:* ${verificationRequest.hand_gesture}\n` +
        `⏱️ Wir prüfen deine Verifizierung schnellstmöglich.\n\n` +
        `Du wirst benachrichtigt, sobald deine Verifizierung bestätigt wurde.`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('❌ Error handling photo:', error);
      console.error('Stack:', error.stack);
      try {
        await bot.sendMessage(
          chatId,
          '❌ Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
          { parse_mode: 'Markdown' }
        );
      } catch (sendError) {
        console.error('❌ Error sending error message:', sendError);
      }
    }
  });

  console.log('✅ Photo handler registered');

  // Handle callback queries (for admin actions)
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const adminId = query.from.id.toString();

    try {
      // Check if user is admin
      const admin = await prisma.user.findFirst({
        where: {
          telegram_id: BigInt(adminId),
          role: { in: ['admin', 'staff'] },
        },
      });

      if (!admin) {
        await bot.answerCallbackQuery(query.id, {
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

      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error('Error handling callback query:', error);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Fehler beim Verarbeiten',
        show_alert: true,
      });
    }
  });
  
  console.log('✅ All bot handlers registered');
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

  await bot.sendMessage(chatId, message, {
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

  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
  });
};

// Send welcome message for verified users
const sendWelcomeMessageVerified = async (chatId, user) => {
  const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';
  const token = generateToken({
    id: user.id,
    telegram_id: user.telegram_id?.toString(),
    role: user.role,
  });

  const message = `✅ *Willkommen zurück!*

Du bist bereits verifiziert und kannst jetzt den vollständigen Shop nutzen! 🎉

*Was möchtest du tun?*`;

  await bot.sendMessage(chatId, message, {
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
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'staff'] },
        telegram_id: { not: null },
      },
    });

    const message = `🔔 *Neue Verifizierungsanfrage*

👤 *User:*
• Name: ${user.full_name || user.username || 'Unbekannt'}
• Telegram: @${user.username || user.telegram_id?.toString()}
• ID: ${user.id.slice(0, 8)}...

✋ *Handzeichen:* ${verificationRequest.hand_gesture}
📸 *Foto:* ${verificationRequest.photo_url ? 'Gesendet ✅' : 'Noch nicht gesendet'}

*Status:* ⏳ Pending

${verificationRequest.photo_url ? '📋 Bitte prüfe das Foto:\n• Gesicht klar erkennbar?\n• Handzeichen sichtbar?' : '⏳ Warte auf Foto...'}`;

    for (const admin of admins) {
      if (admin.telegram_id) {
        try {
          await bot.sendMessage(admin.telegram_id.toString(), message, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
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
              ],
            },
          });
        } catch (error) {
          console.error(`Error notifying admin ${admin.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
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
      await bot.answerCallbackQuery(query.id, {
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

    const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';

    // Notify user
    if (verificationRequest.user.telegram_id) {
      await bot.sendMessage(
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

    // Update admin message
    await bot.editMessageText(
      `✅ *Verifizierung genehmigt*\n\n` +
      `👤 User: ${verificationRequest.user.full_name || verificationRequest.user.username || 'Unbekannt'}\n` +
      `✋ Handzeichen: ${verificationRequest.hand_gesture}\n` +
      `👨‍💼 Genehmigt von: ${admin.full_name || admin.username || 'Admin'}\n` +
      `⏰ ${new Date().toLocaleString('de-DE')}`,
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
      }
    );
  } catch (error) {
    console.error('Error handling admin approval:', error);
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
      await bot.answerCallbackQuery(query.id, {
        text: '❌ Verifizierung nicht gefunden oder bereits bearbeitet',
        show_alert: true,
      });
      return;
    }

    // Ask admin for rejection reason
    await bot.answerCallbackQuery(query.id, {
      text: 'Bitte gib einen Ablehnungsgrund ein',
      show_alert: false,
    });

    // Send message asking for reason
    await bot.sendMessage(
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

    // Store admin state for rejection reason
    // In production, use a proper state management system
    bot.once('message', async (msg) => {
      if (msg.reply_to_message && msg.reply_to_message.text?.includes('Verifizierung ablehnen')) {
        const rejectionReason = msg.text || 'Kein Grund angegeben';

        // Update verification request
        await prisma.verificationRequest.update({
          where: { id: verificationId },
          data: {
            status: 'rejected',
            reviewed_at: new Date(),
            reviewed_by: admin.id,
            rejection_reason: rejectionReason,
          },
        });

        // Update user
        await prisma.user.update({
          where: { id: verificationRequest.user_id },
          data: {
            verification_status: 'rejected',
            rejection_reason: rejectionReason,
          },
        });

        // Notify user
        if (verificationRequest.user.telegram_id) {
          await bot.sendMessage(
            verificationRequest.user.telegram_id.toString(),
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
        await bot.sendMessage(
          query.message.chat.id,
          `✅ *Verifizierung abgelehnt*\n\n` +
          `User: ${verificationRequest.user.full_name || verificationRequest.user.username || 'Unbekannt'}\n` +
          `Grund: ${rejectionReason}`,
          {
            parse_mode: 'Markdown',
          }
        );
      }
    });
  } catch (error) {
    console.error('Error handling admin rejection:', error);
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
      await bot.sendMessage(
        query.message.chat.id,
        '🛒 *Dein Warenkorb ist leer*\n\nFüge Produkte hinzu, um zu bestellen!',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🛍️ Shop öffnen',
                  web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/products` },
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

    await bot.sendMessage(query.message.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🛍️ Shop öffnen',
              web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/cart?token=${token}` },
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
    console.error('Error handling view cart:', error);
    await bot.sendMessage(query.message.chat.id, '❌ Fehler beim Laden des Warenkorbs');
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
      await bot.sendMessage(
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

    await bot.sendMessage(query.message.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📋 Alle Bestellungen anzeigen',
              web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/requests?token=${token}` },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error handling view orders:', error);
    await bot.sendMessage(query.message.chat.id, '❌ Fehler beim Laden der Bestellungen');
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

    await bot.sendMessage(
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
                web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/vip?token=${token}` },
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error('Error handling view VIP:', error);
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

    await bot.sendMessage(
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
                web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/support?token=${token}` },
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error('Error handling view support:', error);
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

    await bot.sendMessage(user.telegram_id.toString(), message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📦 Bestellung anzeigen',
              web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/requests?token=${token}` },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error sending order notification via bot:', error);
  }
};
