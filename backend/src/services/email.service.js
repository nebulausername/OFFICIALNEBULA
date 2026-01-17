import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, body, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@nebula.supply',
      to,
      subject,
      text: body,
      html: html || body?.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send email');
  }
};

export const sendOrderConfirmation = async (order, user) => {
  const subject = `✨ Bestellung eingegangen - Nebula Supply #${order.id.slice(0, 8)}`;
  const body = `
Hallo ${order.contact_info.name},

Deine Bestellung wurde erfolgreich aufgegeben!

Bestellung: #${order.id.slice(0, 8)}
Gesamtsumme: ${order.total_sum.toFixed(2)}€

Wir melden uns schnellstmöglich bei dir.

Viele Grüße,
Dein Nebula Supply Team
  `.trim();

  return await sendEmail({
    to: user.email || order.contact_info.email,
    subject,
    body,
  });
};

export const sendStatusUpdate = async (order, status, message) => {
  const subject = `📦 Status Update - Bestellung #${order.id.slice(0, 8)}`;
  return await sendEmail({
    to: order.contact_info.email,
    subject,
    body: message,
  });
};

