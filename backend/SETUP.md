# Backend Setup Guide

## Schnellstart

### 1. Dependencies installieren
```bash
npm install
```

### 2. Environment konfigurieren
Die `.env` Datei ist bereits erstellt. Falls du PostgreSQL lokal verwendest, passe die `DATABASE_URL` an:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nebula_shop?schema=public"
```

### 3. Database Setup

#### Option A: Mit PostgreSQL (Empfohlen)
```bash
# PostgreSQL installieren (falls nicht vorhanden)
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt install postgresql

# Database erstellen
createdb nebula_shop

# Oder mit psql:
psql -U postgres
CREATE DATABASE nebula_shop;
\q
```

#### Option B: Mit SQLite (Für schnelles Testen)
Ändere in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Dann:
```bash
npx prisma migrate dev --name init
```

### 4. Prisma Client generieren
```bash
npm run db:generate
```

### 5. Database Migrationen
```bash
npm run db:migrate
```

### 6. Seed Data (Optional)
```bash
npm run db:seed
```

### 7. Server starten
```bash
npm run dev
```

Der Server läuft dann auf `http://localhost:8000`

## Nützliche Befehle

- `npm run db:studio` - Prisma Studio öffnen (Database GUI)
- `npm run db:reset` - Database zurücksetzen und neu seeden
- `npm run db:migrate` - Neue Migration erstellen

## Troubleshooting

### Database Connection Error
- Prüfe ob PostgreSQL läuft: `pg_isready`
- Prüfe DATABASE_URL in `.env`
- Prüfe ob Database existiert: `psql -l`

### Port bereits belegt
- Ändere PORT in `.env`
- Oder beende den Prozess auf Port 8000

### Prisma Fehler
- Lösche `node_modules` und `package-lock.json`
- Führe `npm install` erneut aus
- Führe `npx prisma generate` erneut aus

