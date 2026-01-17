# 🚀 Nebula Shop - Komplettes Setup

## ⚡ Schnellstart

### Option 1: Mit PowerShell Scripts (Empfohlen)

**Backend starten:**
```powershell
.\start-backend.ps1
```

**Frontend starten (neues Terminal):**
```powershell
.\start-frontend.ps1
```

### Option 2: Manuell

#### 1. Backend Setup

```powershell
cd backend
npm install
npx prisma generate
```

**Database konfigurieren:**

Erstelle `backend\.env` (falls nicht vorhanden):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nebula_shop?schema=public"
PORT=8000
JWT_SECRET=nebula-shop-super-secret-jwt-key-change-in-production-2024
CORS_ORIGIN=http://localhost:3000
```

**Database erstellen:**
```powershell
# Mit PostgreSQL
createdb nebula_shop

# Oder mit psql:
psql -U postgres
CREATE DATABASE nebula_shop;
\q
```

**Migrationen ausführen:**
```powershell
cd backend
npm run db:migrate
npm run db:seed
```

**Backend starten:**
```powershell
npm run dev
```

#### 2. Frontend Setup

```powershell
# Im Root-Verzeichnis
npm install
```

**Environment konfigurieren:**

Erstelle `.env` (falls nicht vorhanden):
```env
VITE_API_URL=http://localhost:8000/api
```

**Frontend starten:**
```powershell
npm run dev
```

## ✅ Prüfen ob alles läuft

### Backend Health Check
```powershell
curl http://localhost:8000/health
```

Sollte zurückgeben:
```json
{"status":"ok","timestamp":"..."}
```

### Frontend
Öffne Browser: http://localhost:3000

## 🔧 Wichtige Dateien

- `backend\.env` - Backend Konfiguration
- `.env` - Frontend Konfiguration
- `backend\prisma\schema.prisma` - Database Schema
- `QUICKSTART.md` - Kurzanleitung

## 📝 Nächste Schritte

1. **Admin User**: Wird automatisch beim Seed erstellt
   - Email: `admin@nebula.supply`
   - Telegram ID: `123456789`

2. **Test Login:**
```powershell
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"telegram_id\": 123456789, \"username\": \"admin\", \"full_name\": \"Admin\"}'
```

3. **Prisma Studio** (Database GUI):
```powershell
cd backend
npm run db:studio
```

## 🐛 Troubleshooting

### Backend startet nicht
- ✅ Prüfe `backend\.env` existiert
- ✅ Prüfe Database Connection
- ✅ Führe `npx prisma generate` aus

### Database Fehler
- ✅ Prüfe ob PostgreSQL läuft
- ✅ Prüfe DATABASE_URL Format
- ✅ Database existiert: `psql -l | grep nebula_shop`

### Frontend Fehler
- ✅ Prüfe `.env` existiert
- ✅ Prüfe `VITE_API_URL` ist korrekt
- ✅ Prüfe ob Backend läuft

## 🎉 Fertig!

Das System sollte jetzt vollständig funktionsfähig sein!

