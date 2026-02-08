import prisma from '../../config/database.js';
import { botLogger } from '../../utils/botLogger.js';
import { sendMessageWithRetry } from '../../utils/telegramRetry.js';
import { createVerificationRequest } from '../../controllers/verification.controller.js';
import { checkRateLimit, getRemainingCommands } from '../../middleware/botRateLimit.js';

export const handleStart = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || msg.from.first_name || 'User';

    if (checkRateLimit(telegramId, 5)) {
        const remaining = getRemainingCommands(telegramId, 5);
        await sendMessageWithRetry(
            bot,
            chatId,
            `⏱️ *Rate Limit erreicht*\n\nBitte warte einen Moment.\nVerbleibende Anfragen: ${remaining}`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    botLogger.info(`/start command received from ${username} (${telegramId})`);

    try {
        const { user, request, isNew } = await createVerificationRequest(telegramId);

        if (!isNew && user.verification_status === 'verified') {
            await sendMessageWithRetry(
                bot,
                chatId,
                `👋 *Willkommen zurück, ${username}!*\n\nDu bist bereits verifiziert. Nutze /shop um einzukaufen.`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        keyboard: [[{ text: "🛍️ Shop öffnen", web_app: { url: process.env.WEBAPP_URL } }]],
                        resize_keyboard: true
                    }
                }
            );
        } else if (user.verification_status === 'pending') {
            const gesture = request.hand_gesture || '👍';
            await sendMessageWithRetry(
                bot,
                chatId,
                `⏳ *Verifizierung läuft*\n\nBitte sende ein Foto von dir mit dem Handzeichen: ${gesture}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            const gesture = request.hand_gesture || '👍';
            await sendMessageWithRetry(
                bot,
                chatId,
                `👋 *Willkommen bei NEBULA SUPPLY*\n\nUm Zugriff zu erhalten, müssen wir dich verifizieren.\n\n` +
                `📸 Bitte sende ein Foto von dir, auf dem du dieses Handzeichen machst: ${gesture}`,
                { parse_mode: 'Markdown' }
            );
        }
    } catch (error) {
        botLogger.error('Error in /start:', error);
        await sendMessageWithRetry(bot, chatId, '❌ Ein Fehler ist aufgetreten.');
    }
};

export const handleHelp = async (bot, msg) => {
    const chatId = msg.chat.id;
    await sendMessageWithRetry(
        bot,
        chatId,
        `🤖 *Befehle*\n\n` +
        `/start - Verifizierung starten\n` +
        `/shop - Shop öffnen\n` +
        `/cart - Warenkorb ansehen\n` +
        `/code - Login-Code generieren\n` +
        `/sessions - Aktive Sitzungen`,
        { parse_mode: 'Markdown' }
    );
};
