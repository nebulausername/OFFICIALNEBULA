# Nebula Shop - Komplettes Setup

## Frontend Setup

### 1. Dependencies installieren
```bash
npm install
```

### 2. Environment konfigurieren
Die `.env` Datei ist bereits erstellt mit:
```
VITE_API_URL=http://localhost:8000/api
```

### 3. Development Server starten
```bash
npm run dev
```

Frontend läuft auf `http://localhost:3000`

## Backend Setup

### 1. In Backend-Verzeichnis wechseln
```bash
cd backend
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Database Setup

#### PostgreSQL installieren (falls nicht vorhanden)
- **Windows**: https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt install postgresql`

#### Database erstellen
```bash
# Mit psql
psql -U postgres
CREATE DATABASE nebula_shop;
\q

# Oder direkt
createdb nebula_shop
```

#### .env konfigurieren
Die `.env` Datei ist bereits erstellt. Passe die DATABASE_URL an:
```env
DATABASE_URL="postgresql://postgres:dein_passwort@localhost:5432/nebula_shop?schema=public"
```

### 4. Prisma Setup
```bash
# Prisma Client generieren
npm run db:generate

# Database Migrationen erstellen
npm run db:migrate

# Optional: Seed Data
npm run db:seed
```

### 5. Backend starten
```bash
npm run dev
```

Backend läuft auf `http://localhost:8000`

## Vollständiger Start

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

## Erste Schritte

1. **Backend starten** - Server sollte auf Port 8000 laufen
2. **Frontend starten** - App sollte auf Port 3000 laufen
3. **Admin User** - Wird automatisch beim Seed erstellt:
   - Email: `admin@nebula.supply`
   - Telegram ID: `123456789`

## API Testen

### Health Check
```bash
curl http://localhost:8000/health
```

### Login Test
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123456789, "username": "admin", "full_name": "Admin"}'
```

## Nützliche Tools

- **Prisma Studio**: `cd backend && npm run db:studio` - Database GUI
- **API Docs**: Backend läuft auf `http://localhost:8000`
- **Frontend Dev Tools**: React DevTools Browser Extension

## Troubleshooting

### Backend startet nicht
- Prüfe ob Port 8000 frei ist
- Prüfe Database Connection in `.env`
- Prüfe ob alle Dependencies installiert sind

### Frontend kann Backend nicht erreichen
- Prüfe `VITE_API_URL` in `.env`
- Prüfe ob Backend läuft
- Prüfe CORS Einstellungen im Backend

### Database Fehler
- Prüfe ob PostgreSQL läuft
- Prüfe DATABASE_URL Format
- Führe `npm run db:generate` erneut aus

