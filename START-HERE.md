# 🚀 START HIER - Nebula Shop Setup

## ⚡ Schnellstart (3 Schritte)

### Schritt 1: Backend Setup

```powershell
cd backend
npm install
npx prisma generate
```

**Wichtig:** Erstelle `backend\.env` Datei:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nebula_shop?schema=public"
PORT=8000
JWT_SECRET=nebula-shop-super-secret-jwt-key-change-in-production-2024
CORS_ORIGIN=http://localhost:3000
```

**Database erstellen:**
```powershell
# PostgreSQL muss installiert sein
createdb nebula_shop

# Oder mit psql:
psql -U postgres
CREATE DATABASE nebula_shop;
\q
```

**Migrationen:**
```powershell
npm run db:migrate
npm run db:seed
```

**Backend starten:**
```powershell
npm run dev
```

✅ Backend läuft auf: http://localhost:8000

### Schritt 2: Frontend Setup

```powershell
# Im Root-Verzeichnis
npm install
```

**Environment:** `.env` sollte bereits existieren mit:
```
VITE_API_URL=http://localhost:8000/api
```

**Frontend starten:**
```powershell
npm run dev
```

✅ Frontend läuft auf: http://localhost:3000

### Schritt 3: Testen

1. **Backend Health Check:**
```powershell
curl http://localhost:8000/health
```

2. **Frontend öffnen:**
Browser: http://localhost:3000

3. **Admin Login testen:**
- Telegram ID: `123456789`
- Email: `admin@nebula.supply`

## 🎯 Oder nutze die Start-Scripts

**Backend:**
```powershell
.\start-backend.ps1
```

**Frontend (neues Terminal):**
```powershell
.\start-frontend.ps1
```

## 📚 Weitere Dokumentation

- `README-SETUP.md` - Detaillierte Anleitung
- `QUICKSTART.md` - Kurzanleitung
- `CHECK.md` - Checkliste
- `DEPLOYMENT.md` - VPS Deployment

## 🐛 Probleme?

1. **Backend startet nicht:**
   - Prüfe `backend\.env` existiert
   - Prüfe Database Connection
   - Führe `npx prisma generate` aus

2. **Database Fehler:**
   - Prüfe PostgreSQL läuft
   - Prüfe DATABASE_URL Format
   - Database existiert: `psql -l | grep nebula_shop`

3. **Frontend Fehler:**
   - Prüfe `.env` existiert
   - Prüfe Backend läuft
   - Prüfe Browser Console

## ✅ Fertig!

Das System ist jetzt startklar! 🎉

