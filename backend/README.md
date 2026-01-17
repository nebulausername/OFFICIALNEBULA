# Nebula Shop Backend API

Backend API für den Nebula Supply E-Commerce Shop.

## Setup

1. **Dependencies installieren:**
```bash
npm install
```

2. **Umgebungsvariablen konfigurieren:**
Kopiere `.env.example` zu `.env` und fülle die Werte aus:
```bash
cp .env.example .env
```

3. **Database Setup:**
```bash
# Prisma Client generieren
npm run db:generate

# Database Migrationen ausführen
npm run db:migrate

# Optional: Database Studio öffnen
npm run db:studio
```

4. **Server starten:**
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrierung
- `GET /api/auth/me` - Aktueller User
- `PATCH /api/auth/me` - Profil aktualisieren
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Produkte auflisten
- `GET /api/products/:id` - Produkt abrufen
- `POST /api/products` - Produkt erstellen (Admin)
- `PATCH /api/products/:id` - Produkt aktualisieren (Admin)
- `DELETE /api/products/:id` - Produkt löschen (Admin)

### Cart
- `GET /api/cart-items` - Warenkorb abrufen
- `POST /api/cart-items` - Zum Warenkorb hinzufügen
- `PATCH /api/cart-items/:id` - Warenkorb-Item aktualisieren
- `DELETE /api/cart-items/:id` - Aus Warenkorb entfernen

### Orders
- `GET /api/requests` - Bestellungen auflisten
- `GET /api/requests/:id` - Bestellung abrufen
- `POST /api/requests` - Bestellung erstellen
- `PATCH /api/requests/:id/status` - Status aktualisieren (Admin)

### Tickets
- `GET /api/tickets` - Tickets auflisten
- `GET /api/tickets/:id` - Ticket abrufen
- `POST /api/tickets` - Ticket erstellen
- `POST /api/tickets/:id/messages` - Nachricht senden

### Admin
- `GET /api/admin/stats` - Dashboard Statistiken
- `GET /api/admin/users` - User auflisten
- `PATCH /api/admin/users/:id/vip` - VIP Status ändern

## Database Schema

Siehe `prisma/schema.prisma` für das vollständige Schema.

## Technologie-Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer
- **Telegram**: node-telegram-bot-api

