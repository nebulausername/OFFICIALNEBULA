# Vercel Environment Variables Setup

## Wichtige Environment-Variablen für Vercel

Gehe zu: **Vercel Dashboard → Dein Projekt → Settings → Environment Variables**

### 1. DATABASE_URL (WICHTIG: Session Pooler verwenden!)
```
postgresql://postgres.imiitgxrweucowymbwiz:STARKESPASSWORT52241@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```
**Wichtig:** Verwende die Session Pooler URL (Port 6543), nicht die direkte Verbindung!

### 2. TELEGRAM_BOT_TOKEN
```
Dein Telegram Bot Token (von @BotFather)
```

### 3. USE_WEBHOOK
```
true
```

### 4. WEBAPP_URL
```
https://officialnebula.vercel.app
```

### 5. JWT_SECRET
```
Generiere mit: openssl rand -base64 32
Oder nutze einen sicheren zufälligen String
```

### 6. NODE_ENV
```
production
```

### 7. CORS_ORIGIN
```
https://officialnebula.vercel.app
```

### 8. BOT_LOG_LEVEL (optional)
```
INFO
```

## Nach dem Deployment

### Webhook bei Telegram setzen:
```
https://api.telegram.org/bot<DEIN_BOT_TOKEN>/setWebhook?url=https://officialnebula.vercel.app/api/telegram/webhook
```

### Status prüfen:
```
https://officialnebula.vercel.app/api/telegram/webhook/status
```
