import prisma from '../../config/database.js';
import { botLogger } from '../../utils/botLogger.js';
import { sendMessageWithRetry } from '../../utils/telegramRetry.js';

export const handleShop = async (bot, msg) => {
    const chatId = msg.chat.id;
    await sendMessageWithRetry(
        bot,
        chatId,
        '🛍️ *Nebula Shop*\n\nKlicke unten, um den Shop zu öffnen:',
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Shop öffnen", web_app: { url: process.env.WEBAPP_URL } }]
                ]
            }
        }
    );
};

export const handleCart = async (bot, msg) => {
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

        if (!user || user.cart_items.length === 0) {
            await sendMessageWithRetry(bot, chatId, '🛒 Dein Warenkorb ist leer.');
            return;
        }

        let message = '🛒 *Warenkorb*\n\n';
        let total = 0;

        user.cart_items.forEach((item) => {
            const price = parseFloat(item.product.price);
            total += price * item.quantity;
            message += `• ${item.product.name} (${item.quantity}x) - ${price.toFixed(2)}€\n`;
        });

        message += `\n💰 *Gesamt: ${total.toFixed(2)}€*`;

        await sendMessageWithRetry(bot, chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Zur Kasse", web_app: { url: `${process.env.WEBAPP_URL}/checkout` } }]
                ]
            }
        });

    } catch (error) {
        botLogger.error('Error in /cart:', error);
        await sendMessageWithRetry(bot, chatId, '❌ Fehler beim Laden des Warenkorbs.');
    }
};
