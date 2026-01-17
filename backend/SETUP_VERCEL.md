# Vercel Setup - Komplette Anleitung

## ✅ Was bereits gemacht wurde:
- ✅ Prisma-Schema auf PostgreSQL umgestellt
- ✅ .env.example mit allen Variablen erstellt
- ✅ Webhook-Integration implementiert

## 📋 Schritt 1: Environment-Variablen in Vercel setzen

Gehe zu: **Vercel Dashboard → Dein Projekt → Settings → Environment Variables**

Füge folgende Variablen hinzu (für Production, Preview UND Development):

### 1. DATABASE_URL
```
postgresql://postgres.imiitgxrweucowymbwiz:STARKESPASSWORT52241@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```
**WICHTIG:** Das ist die Session Pooler URL (Port 6543) - funktioniert mit Vercel!

### 2. TELEGRAM_BOT_TOKEN
```
Dein Bot-Token von @BotFather
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
Generiere einen sicheren Secret:
```bash
openssl rand -base64 32
```
Oder nutze einen zufälligen String (mindestens 32 Zeichen)

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

## 📋 Schritt 2: Migration durchführen

Nachdem die Environment-Variablen gesetzt sind, führe die Migration aus:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

**Oder lokal testen:**
```bash
cd backend
npx prisma migrate dev --name init_postgres
```

## 📋 Schritt 3: Deployment auf Vercel

1. Committe alle Änderungen:
```bash
git add .
git commit -m "PostgreSQL migration and Vercel setup"
git push
```

2. Vercel deployt automatisch (wenn GitHub verbunden ist)

## 📋 Schritt 4: Webhook bei Telegram setzen

Nach dem ersten erfolgreichen Deployment:

1. **Status prüfen:**
   ```
   https://officialnebula.vercel.app/api/telegram/webhook/status
   ```

2. **Webhook setzen:**
   ```
   https://api.telegram.org/bot<DEIN_BOT_TOKEN>/setWebhook?url=https://officialnebula.vercel.app/api/telegram/webhook
   ```

3. **Webhook-Info prüfen:**
   ```
   https://api.telegram.org/bot<DEIN_BOT_TOKEN>/getWebhookInfo
   ```

## 🧪 Testen

1. **Bot testen:**
   - Öffne Telegram
   - Suche nach `@NebulaOrderBot`
   - Sende `/start`
   - Bot sollte sofort antworten!

2. **WebView testen:**
   - Klicke auf "Shop öffnen" Button im Bot
   - WebView sollte sich öffnen

## ❌ Troubleshooting

### Bot antwortet nicht:
- Prüfe: `https://officialnebula.vercel.app/api/telegram/webhook/status`
- Prüfe Vercel Logs: Dashboard → Dein Projekt → Logs
- Stelle sicher, dass `USE_WEBHOOK=true` gesetzt ist

### Datenbank-Fehler:
- Prüfe, ob DATABASE_URL die Session Pooler URL ist (Port 6543)
- Prüfe, ob Migration durchgeführt wurde
- Prüfe Supabase Dashboard → Database → Connection Pooling

### WebView öffnet nicht:
- Prüfe, ob `WEBAPP_URL` korrekt gesetzt ist
- Prüfe, ob Token in der URL korrekt generiert wird

## 📞 Support

Bei Problemen:
1. Prüfe Vercel Logs
2. Prüfe Supabase Logs
3. Prüfe Telegram Bot Status
