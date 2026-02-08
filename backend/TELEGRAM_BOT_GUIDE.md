# NEBULA SUPPLY - Telegram Bot Guide

## Overview

The NEBULA SUPPLY Telegram Bot provides user verification, shop browsing, and admin notification features directly through Telegram. It uses `node-telegram-bot-api` for robust message handling and supports both polling (development) and webhook (production) modes.

## Features

### User Commands
- `/start` - Begin verification process or return to main menu (if verified)
- `/shop` - Browse products by category
- `/cart` - View shopping cart
- `/help` - Show available commands

### Admin Features
- Instant verification notifications
- Approve/Reject buttons with quick rejection reasons
- Photo preview links
- Admin panel integration

### Technical Features
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Auto-Reconnect**: Automatically recovers from connection errors
- **Rate Limiting**: 5 requests per minute per user
- **Retry Logic**: 3 attempts with exponential backoff
- **Admin Caching**: 1-minute TTL for performance

## Setup

### 1. Environment Variables

```bash
# Required
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Optional
TELEGRAM_CHAT_ID=admin_chat_id  # For order notifications  
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook  # Production only
USE_WEBHOOK=false  # Set to 'true' for production
```

### 2. Get Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Copy the token and add to `.env`

### 3. Start the Bot

**Development (Polling):**
```bash
cd backend
npm install
npm run dev
# Bot starts automatically
```

**Production (Webhook):**
```bash
# Deploy to Vercel or your server
# Set TELEGRAM_WEBHOOK_URL in environment variables
# Bot uses webhook mode automatically in production
```

## Troubleshooting

### Bot not receiving messages

**Check:**
```bash
# 1. Verify token
echo $TELEGRAM_BOT_TOKEN

# 2. Check bot status
curl https://api.telegram.org/bot<TOKEN>/getMe

# 3. Check webhook conflicts
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# 4. Delete webhook (if needed for polling)
curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
```

### Polling errors in development

**Common causes:**
- Webhook is still set → Delete it
- Another instance running → Stop other processes
- Network firewall → Check connection

**Fix:**
```bash
# Stop all Node processes (Windows)
taskkill /F /IM node.exe

# Clear webhook
curl https://api.telegram.org/bot<TOKEN>/deleteWebhook

# Restart server
npm run dev
```

## Testing

- [ ] `/start` - Verification starts
- [ ] Send photo - Upload works
- [ ] Admin receives notification
- [ ] Approve/Reject buttons work
- [ ] WebApp link opens correctly

---

**Last Updated:** 2026-02-05  
**Bot Version:** 1.0.0
