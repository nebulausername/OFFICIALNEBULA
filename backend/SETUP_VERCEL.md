# Vercel Setup - Komplette Anleitung (Neon Update)

## ✅ Was bereits gemacht wurde:
- ✅ Prisma-Schema auf PostgreSQL (Neon) umgestellt
- ✅ .env mit neuen Credentials aktualisiert
- ✅ Webhook-Integration vorbereitet

## 📋 Schritt 1: Environment-Variablen in Vercel setzen

Gehe zu: **Vercel Dashboard → Dein Projekt → Settings → Environment Variables**

Füge folgende Variablen hinzu (für Production, Preview UND Development):

### 1. DATABASE_URL (Pooled)
```
postgresql://neondb_owner:npg_73ZhrnXQEJMw@ep-curly-silence-ahf3ow1l-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. DIRECT_URL (Unpooled - WICHTIG für Migrationen!)
```
postgresql://neondb_owner:npg_73ZhrnXQEJMw@ep-curly-silence-ahf3ow1l.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. TELEGRAM_BOT_TOKEN
```
7363417926:AAFF9c6g2Yp3EQ9z1ad-MRZM59f1JaRSMHM
```

### 4. USE_WEBHOOK
```
true
```

### 5. WEBAPP_URL
```
https://officialnebula.vercel.app
```

### 6. JWT_SECRET
```
nebula-supply-jwt-secret-key-2026-super-secure
```
*(Oder einen neuen generieren: `openssl rand -base64 32`)*

### 7. NODE_ENV
```
production
```

### 8. CORS_ORIGIN
```
https://officialnebula.vercel.app
```

## 📋 Schritt 2: Migration durchführen

Da wir zu einer neuen Datenbank (Neon) gewechselt haben, muss einmalig das Schema gepusht werden.
Lokal habe ich das bereits versucht (`npx prisma db push`).

In Vercel wird dies durch das `postinstall` Skript automatisch gehandhabt, **sofern** die `DIRECT_URL` gesetzt ist!

## 📋 Schritt 3: Deployment auf Vercel

1. **GitHub Push:** Änderungen wurden bereits gepusht.
2. **Vercel Redeploy:** Falls der letzte Build fehlgeschlagen ist, trigger ein Redeployment im Vercel Dashboard, **nachdem** die Environment-Variablen gesetzt sind.

## 🧪 Testen

Prüfe nach dem Deployment, ob der Bot antwortet und der Shop Daten lädt.

## ❌ Troubleshooting

- **Fehler bei Migration:** Prüfe `DIRECT_URL` (muss die "unpooled" URL sein).
- **Verbindungsfehler:** Prüfe `DATABASE_URL` (muss die "pooled" URL sein).
