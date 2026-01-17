# ✅ Setup Checkliste

## Backend Setup

- [ ] `cd backend`
- [ ] `npm install` ausgeführt
- [ ] `backend\.env` Datei erstellt und konfiguriert
- [ ] PostgreSQL installiert und läuft
- [ ] Database `nebula_shop` erstellt
- [ ] `npx prisma generate` ausgeführt
- [ ] `npm run db:migrate` ausgeführt
- [ ] `npm run db:seed` ausgeführt (optional)
- [ ] `npm run dev` - Backend läuft auf Port 8000

## Frontend Setup

- [ ] `npm install` ausgeführt (im Root-Verzeichnis)
- [ ] `.env` Datei erstellt mit `VITE_API_URL=http://localhost:8000/api`
- [ ] `npm run dev` - Frontend läuft auf Port 3000

## Testen

- [ ] Backend Health Check: `curl http://localhost:8000/health`
- [ ] Frontend öffnet: http://localhost:3000
- [ ] Keine CORS Fehler in Browser Console
- [ ] Admin Login funktioniert (Telegram ID: 123456789)

## Troubleshooting

### Backend startet nicht
```powershell
# Prüfe .env
cat backend\.env

# Prüfe Database
psql -U postgres -l

# Prisma neu generieren
cd backend
npx prisma generate
```

### Frontend kann Backend nicht erreichen
```powershell
# Prüfe .env
cat .env

# Prüfe Backend läuft
curl http://localhost:8000/health
```

### Database Fehler
```powershell
# Prüfe PostgreSQL läuft
pg_isready

# Database neu erstellen
createdb nebula_shop

# Migrationen neu ausführen
cd backend
npm run db:migrate
```

