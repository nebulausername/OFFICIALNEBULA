import prisma from '../../config/database.js';
import { botLogger } from '../../utils/botLogger.js';
import { sendMessageWithRetry } from '../../utils/telegramRetry.js';
import { uploadVerificationPhoto } from '../../services/storage.service.js';
import { validateTelegramMessage } from '../../services/telegram-bot.service.js'; // Need to export this or move to utils
import fetch from 'node-fetch'; // Should be available in Node 18+ global or package

// Helper to download file from Telegram
const downloadFileFromTelegram = async (bot, fileId) => {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
};

export const handlePhotoMessage = async (bot, msg) => {
    if (!msg || !msg.from || !msg.chat) return;

    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const photo = msg.photo;

    if (!photo || photo.length === 0) return;

    // Skip command replies
    if (msg.text?.startsWith('/')) return;

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

        // Get largest photo
        const largestPhoto = photo[photo.length - 1];
        const fileId = largestPhoto.file_id;

        // Notify user processing
        await sendMessageWithRetry(bot, chatId, '⏳ Foto wird verarbeitet...');

        // Download
        const buffer = await downloadFileFromTelegram(bot, fileId);

        // Upload to InsForge
        const filename = `verifications/${user.id}_${Date.now()}.jpg`;
        const uploadResult = await uploadVerificationPhoto(buffer, filename);

        if (!uploadResult) {
            throw new Error('Upload to InsForge failed');
        }

        botLogger.info(`Photo uploaded to InsForge: ${uploadResult.url}`);

        // Update DB
        await prisma.verificationRequest.update({
            where: { id: verificationRequest.id },
            data: {
                photo_url: uploadResult.url,
            },
        });

        // Update User
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verification_submitted_at: new Date(),
            },
        });

        // Notify User Success
        await sendMessageWithRetry(
            bot,
            chatId,
            '✅ *Foto empfangen!*\n\nWir prüfen deine Verifizierung so schnell wie möglich. Du erhältst eine Benachrichtigung.',
            { parse_mode: 'Markdown' }
        );

        // Notify Admins (Socket)
        try {
            const { getIO } = await import('../../services/socket.service.js');
            const io = getIO();
            if (io) {
                io.to('role_admin').emit('verification:updated', {
                    id: verificationRequest.id,
                    user: {
                        id: user.id,
                        full_name: user.full_name,
                        telegram_id: user.telegram_id.toString()
                    },
                    photo_url: uploadResult.url,
                    status: 'pending'
                });
            }
        } catch (socketError) {
            botLogger.warn('Failed to emit socket event:', socketError);
        }

    } catch (error) {
        botLogger.error('Error handling photo message:', error);
        await sendMessageWithRetry(
            bot,
            chatId,
            '❌ Fehler beim Speichern des Fotos. Bitte versuche es erneut.',
            { parse_mode: 'Markdown' }
        );
    }
};

// NEW: Handle /verify command
export const handleVerify = async (bot, msg) => {
    if (!msg || !msg.from || !msg.chat) return;

    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
        botLogger.info(`Verification request from ${telegramId}`);

        // Find user
        const user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(telegramId) },
        });

        if (!user) {
            await sendMessageWithRetry(bot, chatId, '❌ *Account nicht gefunden*\n\nBitte verknüpfe zuerst deinen Telegram-Account im Web-Portal.');
            return;
        }

        // Check if already verified
        if (user.verification_status === 'verified') {
            await sendMessageWithRetry(bot, chatId, '✅ *Bereits verifiziert*\n\nDu hast bereits vollen Zugriff.');

            // Force emit event anyway to sync sessions if stuck
            try {
                const { getIO } = await import('../../services/socket.service.js');
                const io = getIO();
                if (io) {
                    io.to(`user_${user.id}`).emit('auth:verified', {
                        status: 'verified',
                        user_id: user.id
                    });
                }
            } catch (e) { console.error("Socket emit fail", e); }
            return;
        }

        // Update Status to Verified (Trusting the Telegram User)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verification_status: 'verified',
                verified_at: new Date(),
                verified_by: 'system_telegram_auto'
            }
        });

        await sendMessageWithRetry(bot, chatId, '🚀 *Verifizierung erfolgreich!*\n\nDein Account wurde freigeschaltet. Das Web-Portal sollte sich automatisch aktualisieren.');

        // Emit Realtime Event
        try {
            const { getIO } = await import('../../services/socket.service.js');
            const io = getIO();
            if (io) {
                io.to(`user_${user.id}`).emit('auth:verified', {
                    status: 'verified',
                    user_id: user.id
                });
                botLogger.info(`Emitted auth:verified for user ${user.id}`);
            }
        } catch (socketError) {
            botLogger.warn('Failed to emit socket event:', socketError);
        }

    } catch (error) {
        botLogger.error('Error in handleVerify:', error);
        await sendMessageWithRetry(bot, chatId, '❌ Ein Fehler ist aufgetreten.');
    }
};
