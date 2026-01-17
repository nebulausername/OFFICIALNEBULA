# 🚀 Quick Start Guide - Nebula Shop

## ⚡ Schnellstart (5 Minuten)

### 1️⃣ Backend Setup
```bash
cd backend
npm install
npx prisma generate
```

### 2️⃣ Database Setup

**Option A: PostgreSQL (Empfohlen)**
```bash
# Database erstellen
createdb nebula_shop

# Migrationen ausführen
npm run db:migrate

# Seed Data
npm run db:seed
```

**Option B: SQLite (Schnelltest)**
1. Öffne `backend/prisma/schema.prisma`
2. Ändere `provider = "postgresql"` zu `provider = "sqlite"`
3. Ändere `url` zu `url = "file:./dev.db"`
4. Dann:
```bash
npm run db:migrate
npm run db:seed
```

### 3️⃣ Backend starten
```bash
npm run dev
```
✅ Backend läuft auf `http://localhost:8000`

### 4️⃣ Frontend starten
```bash
# In Root-Verzeichnis
npm install
npm run dev
```
✅ Frontend läuft auf `http://localhost:3000`

## 🎯 Testen

### Health Check
```bash
curl http://localhost:8000/health
```

### Admin Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123456789, "username": "admin", "full_name": "Admin"}'
```

## 📝 Wichtige URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health
- **Prisma Studio**: `cd backend && npm run db:studio`

## 🔧 Troubleshooting

### Backend startet nicht
- ✅ Prüfe `.env` Datei in `backend/`
- ✅ Prüfe Database Connection
- ✅ Führe `npx prisma generate` aus

### Frontend kann Backend nicht erreichen
- ✅ Prüfe `VITE_API_URL` in `.env`
- ✅ Prüfe ob Backend läuft
- ✅ Prüfe Browser Console für CORS Fehler

### Database Fehler
- ✅ Prüfe ob PostgreSQL läuft: `pg_isready`
- ✅ Prüfe DATABASE_URL Format
- ✅ Führe `npm run db:generate` erneut aus

## 🎉 Fertig!

Das System sollte jetzt vollständig funktionsfähig sein!

