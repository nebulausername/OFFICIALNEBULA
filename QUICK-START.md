# 🚀 Quick Start Guide - Nebula Shop

## Schnellstart mit pnpm

### 1. pnpm installieren (falls noch nicht vorhanden)
```powershell
npm install -g pnpm
```

### 2. Alles starten
```powershell
.\start-all.ps1
```

Das Script macht automatisch:
- ✅ Prüft ob pnpm installiert ist
- ✅ Erstellt `.env` Dateien (Frontend + Backend)
- ✅ Installiert alle Dependencies mit pnpm
- ✅ Generiert Prisma Client
- ✅ Führt Database Migrationen aus
- ✅ Seeded die Database mit Testdaten
- ✅ Startet Backend und Frontend in separaten Fenstern

### 3. Backend Database konfigurieren

**WICHTIG:** Nach dem ersten Start musst du die `DATABASE_URL` in `backend\.env` anpassen:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nebula_shop?schema=public"
```

**PostgreSQL Setup:**
1. PostgreSQL installieren: https://www.postgresql.org/download/windows/
2. Database erstellen:
   ```sql
   psql -U postgres
   CREATE DATABASE nebula_shop;
   \q
   ```
3. `DATABASE_URL` in `backend\.env` anpassen

**Dann erneut ausführen:**
```powershell
.\start-all.ps1
```

### 4. Zugriff

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api

## Manueller Start (falls Script nicht funktioniert)

### Frontend:
```powershell
pnpm install
pnpm run dev
```

### Backend:
```powershell
cd backend
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm run db:seed
pnpm run dev
```

## Troubleshooting

### "pnpm nicht gefunden"
```powershell
npm install -g pnpm
```

### "DATABASE_URL nicht gefunden"
- Öffne `backend\.env`
- Passe `DATABASE_URL` an deine PostgreSQL-Installation an

### "Port bereits belegt"
- Backend läuft bereits auf Port 8000
- Frontend läuft bereits auf Port 3000
- Beende die laufenden Prozesse oder ändere die Ports in den `.env` Dateien

### "Migration fehlgeschlagen"
```powershell
cd backend
pnpm exec prisma migrate reset
pnpm exec prisma migrate dev
pnpm run db:seed
```
