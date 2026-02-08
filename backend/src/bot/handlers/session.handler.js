import prisma from '../../config/database.js';
import { botLogger } from '../../utils/botLogger.js';
import { sendMessageWithRetry } from '../../utils/telegramRetry.js';

export const handleCode = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
        const user = await prisma.user.findUnique({ where: { telegram_id: BigInt(telegramId) } });
        if (!user) {
            await sendMessageWithRetry(bot, chatId, '❌ Bitte starte erst mit /start');
            return;
        }

        // Dynamic import to avoid circular dep
        const { generateLinkCode } = await import('../../services/session.service.js');
        const result = await generateLinkCode(user.id, 'login');

        await sendMessageWithRetry(
            bot,
            chatId,
            `🔐 *Login Code:*\n\`${result.code}\`\n\nGültig für 5 Minuten.`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        botLogger.error('Error in /code:', error);
        await sendMessageWithRetry(bot, chatId, '❌ Fehler beim Generieren des Codes.');
    }
};

export const handleSessions = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
        const user = await prisma.user.findUnique({ where: { telegram_id: BigInt(telegramId) } });
        if (!user) return;

        const { getUserSessions } = await import('../../services/session.service.js');
        const sessions = await getUserSessions(user.id);

        if (sessions.length === 0) {
            await sendMessageWithRetry(bot, chatId, 'Keine aktiven Sitzungen.');
            return;
        }

        let msgText = '📱 *Aktive Sitzungen:*\n\n';
        sessions.forEach((s, i) => {
            msgText += `${i + 1}. ${s.device_type} - ${new Date(s.last_used_at).toLocaleString()}\n`;
        });

        await sendMessageWithRetry(bot, chatId, msgText, { parse_mode: 'Markdown' });
    } catch (error) {
        botLogger.error('Error in /sessions:', error);
    }
};
