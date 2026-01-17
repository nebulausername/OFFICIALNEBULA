# 🗄️ Database Setup Anleitung

## Problem: DATABASE_URL fehlt

Die `DATABASE_URL` wurde zur `.env` Datei hinzugefügt. Du musst jetzt:

## Option 1: PostgreSQL verwenden (Empfohlen)

### 1. PostgreSQL installieren (falls nicht vorhanden)
- Windows: https://www.postgresql.org/download/windows/
- Oder mit Chocolatey: `choco install postgresql`

### 2. PostgreSQL starten
```powershell
# Als Service starten (Windows)
net start postgresql-x64-XX

# Oder manuell starten
pg_ctl -D "C:\Program Files\PostgreSQL\XX\data" start
```

### 3. Datenbank erstellen
```powershell
# Mit psql
psql -U postgres
CREATE DATABASE nebula_shop;
\q

# Oder direkt
createdb -U postgres nebula_shop
```

### 4. Credentials in .env anpassen
Falls dein PostgreSQL-Benutzer/Passwort anders ist, passe die `.env` an:
```env
DATABASE_URL="postgresql://DEIN_USERNAME:DEIN_PASSWORT@localhost:5432/nebula_shop?schema=public"
```

### 5. Migrationen ausführen
```powershell
cd backend
npm run db:migrate
```

### 6. Daten seeden
```powershell
npm run db:seed
```

## Option 2: SQLite verwenden (Schneller für Tests)

### 1. Schema ändern
In `backend/prisma/schema.prisma` ändern:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Migrationen ausführen
```powershell
cd backend
npx prisma migrate dev --name init
```

### 3. Daten seeden
```powershell
npm run db:seed
```

## Prüfen ob es funktioniert

```powershell
cd backend
npm run db:seed
```

Falls es funktioniert, siehst du:
```
✅ Department created: Herren
✅ Department created: Damen
✅ Department created: Unisex
✅ Department created: Accessoires
✅ Category created: ...
✅ Product created: ...
```

## Troubleshooting

### "Connection refused" oder "could not connect"
- PostgreSQL läuft nicht → Starte PostgreSQL
- Falsche Credentials → Passe `.env` an
- Port nicht 5432 → Passe Port in `.env` an

### "Database does not exist"
- Erstelle die Datenbank: `createdb -U postgres nebula_shop`

### "Password authentication failed"
- Passe Username/Password in `.env` an
- Oder setze PostgreSQL-Passwort: `psql -U postgres -c "ALTER USER postgres PASSWORD 'dein_passwort';"`
