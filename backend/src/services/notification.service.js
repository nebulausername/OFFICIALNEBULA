import nodemailer from 'nodemailer';
import { sendTelegramMessage } from './telegram.service.js';
import { notifyUser } from './socket.service.js';
import prisma from '../config/database.js';

// Initialize Email Transporter
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const NotificationChannels = {
    EMAIL: 'email',
    TELEGRAM: 'telegram',
    IN_APP: 'in_app',
};

/**
 * Send a notification via multiple channels
 * @param {object} params
 * @param {string} params.userId - User ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body
 * @param {string[]} params.channels - Array of channels to use
 * @param {object} params.data - Additional data
 */
export const sendNotification = async ({ userId, title, message, channels = [], data = {} }) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const results = {};

    // 1. In-App Notification (Socket)
    if (channels.includes(NotificationChannels.IN_APP)) {
        notifyUser(userId, 'notification:new', {
            title,
            message,
            timestamp: new Date(),
            ...data
        });
        results.in_app = true;
    }

    // 2. Telegram Notification
    if (channels.includes(NotificationChannels.TELEGRAM) && user.telegram_id) {
        try {
            await sendTelegramMessage(user.telegram_id.toString(), `*${title}*\n\n${message}`, { parse_mode: 'Markdown' });
            results.telegram = true;
        } catch (error) {
            console.error('Failed to send Telegram notification:', error);
            results.telegram = false;
        }
    }

    // 3. Email Notification
    if (channels.includes(NotificationChannels.EMAIL) && user.email) {
        try {
            await emailTransporter.sendMail({
                from: process.env.SMTP_FROM || '"Nebula Supply" <noreply@nebulasupply.com>',
                to: user.email,
                subject: title,
                text: message,
                html: `<div style="font-family: sans-serif;"><h2>${title}</h2><p>${message.replace(/\n/g, '<br>')}</p></div>`,
            });
            results.email = true;
        } catch (error) {
            console.error('Failed to send Email notification:', error);
            results.email = false;
        }
    }

    return results;
};
