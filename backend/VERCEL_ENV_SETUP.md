# Vercel Environment Variables Setup (Neon Edition)

## Wichtige Environment-Variablen für Vercel

Gehe zu: **Vercel Dashboard → Dein Projekt → Settings → Environment Variables**

### 1. DATABASE_URL (Pooled Connection)
**Wert:**
```
postgresql://neondb_owner:npg_73ZhrnXQEJMw@ep-curly-silence-ahf3ow1l-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. DIRECT_URL (Direct Connection for Migrations)
**Wert:**
```
postgresql://neondb_owner:npg_73ZhrnXQEJMw@ep-curly-silence-ahf3ow1l.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. TELEGRAM_BOT_TOKEN
**Wert:** `7363417926:AAFF9c6g2Yp3EQ9z1ad-MRZM59f1JaRSMHM`

### 4. JWT_SECRET
**Wert:** `nebula-supply-jwt-secret-key-2026-super-secure`

### 5. WEBAPP_URL
**Wert:** `https://officialnebula.vercel.app`

### 6. USE_WEBHOOK
**Wert:** `true`

### 7. CORS_ORIGIN
**Wert:** `https://officialnebula.vercel.app`

## Hinweis
Ohne `DIRECT_URL` können Migrationen (Prisma Client Generation während des Deployments) fehlschlagen!
