# Nebula Shop

Premium E-Commerce Shop für nebula.supply

## Setup

1. Dependencies installieren:
```bash
npm install
```

2. Umgebungsvariablen konfigurieren:
Erstelle eine `.env` Datei mit:
```
VITE_API_URL=http://localhost:8000/api
```

3. Development Server starten:
```bash
npm run dev
```

Die App läuft dann auf `http://localhost:3000`

## Build

Production Build erstellen:
```bash
npm run build
```

## API-Konfiguration

Die App erwartet ein Backend-API unter der in `VITE_API_URL` konfigurierten URL.

### Erwartete API-Endpoints:

- `GET /api/auth/me` - Aktueller User
- `POST /api/auth/logout` - Logout
- `PATCH /api/auth/me` - User aktualisieren
- `GET /api/products` - Produkte auflisten
- `GET /api/products/:id` - Produkt abrufen
- `POST /api/products` - Produkt erstellen
- `PATCH /api/products/:id` - Produkt aktualisieren
- `DELETE /api/products/:id` - Produkt löschen
- (Ähnlich für alle anderen Entities: categories, brands, departments, cart-items, requests, tickets, etc.)
- `POST /api/upload` - File Upload
- `POST /api/email` - Email versenden
