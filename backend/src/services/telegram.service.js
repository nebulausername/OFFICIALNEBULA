import TelegramBot from 'node-telegram-bot-api';

let bot = null;

if (process.env.TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
}

export const sendTelegramMessage = async (chatId, message, options = {}) => {
  if (!bot) {
    console.warn('Telegram bot not configured');
    return { success: false, message: 'Telegram bot not configured' };
  }

  try {
    const result = await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      ...options,
    });
    return { success: true, messageId: result.message_id };
  } catch (error) {
    console.error('Telegram error:', error);
    throw new Error('Failed to send Telegram message');
  }
};

export const sendOrderNotification = async (order, user) => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) return;

  const message = `
🌟 *NEUE BESTELLUNG - NEBULA SUPPLY* 🌟
━━━━━━━━━━━━━━━━━━━━

👤 *Kunde:* ${order.contact_info.name}
📞 *Telefon:* ${order.contact_info.phone || 'N/A'}
💬 *Telegram:* ${order.contact_info.telegram}
📧 *Email:* ${user.email || 'N/A'}

💰 *Gesamtsumme:* ${order.total_sum.toFixed(2)}€
📦 *Status:* ${order.status}

🆔 *Bestellung-ID:* ${order.id.slice(0, 8)}

${order.note ? `📝 *Notiz:* ${order.note}` : ''}

━━━━━━━━━━━━━━━━━━━━
⚡ Nebula Supply
  `.trim();

  return await sendTelegramMessage(chatId, message);
};

