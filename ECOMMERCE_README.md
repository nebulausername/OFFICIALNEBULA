# 🔥 NEBULA E-COMMERCE TELEGRAM BOT

Ein kompletter E-Commerce Shop über Telegram mit modernem Admin Dashboard!

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## ✨ Features

### 🤖 Telegram Shop Bot
- ✅ Produktkatalog nach Kategorien durchsuchen
- ✅ Einkaufswagen mit Mengenverwaltung
- ✅ Checkout mit Kontaktdaten
- ✅ Automatische Bestandsverwaltung
- ✅ Bestellbestätigungen

### 💎 Admin Dashboard
- ✅ Premium Glassmorphism Design
- ✅ Produktverwaltung (CRUD)
- ✅ Bestellmanagement mit Status-Updates
- ✅ Kundenliste & Analytics
- ✅ Real-time Statistiken

### 🔒 Technologie
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma
- **Bot:** Telegraf (Telegram Bot Framework)
- **Frontend:** Vanilla JS + Custom CSS
- **Auth:** JWT

---

## 🚀 Quick Start

### 1️⃣ Telegram Bot Token holen

1. Öffne Telegram → Suche [@BotFather](https://t.me/botfather)
2. Schicke `/newbot`
3. Folge den Anweisungen
4. Kopiere den **Bot Token**

### 2️⃣ Projekt Setup

```powershell
# Navigate zu backend
cd backend

# Quick Start Script (Windows)
.\quick-start.ps1

# Oder manuell:
npm install
npm run db:generate
npm run db:migrate
```

### 3️⃣ Environment konfigurieren

Erstelle `.env` im `backend` Ordner:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
TELEGRAM_BOT_TOKEN="your-bot-token-here"
JWT_SECRET="your-secret-key"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="SecurePass123"
PORT=8000
```

### 4️⃣ Server starten

```bash
npm start
```

Du solltest sehen:
```
🚀 Server running on port 8000
✅ Telegram Bot initialized successfully!
✅ Shop Bot initialized successfully!
```

---

## 📱 Bot Befehle

### Für Kunden:
```
/start - Bot starten & Willkommensnachricht
/shop  - Produktkatalog öffnen
/cart  - Warenkorb anzeigen
/help  - Hilfe anzeigen
```

### Usage Flow:
1. `/shop` → Kategorie wählen
2. Produkte durchblättern (◀️ ▶️)
3. "🛒 In den Warenkorb" klicken
4. `/cart` → "✅ Zur Kasse"
5. Kontaktdaten eingeben
6. Bestätigen → Fertig! 🎉

---

## 💻 Admin Dashboard

### Zugriff
```
http://localhost:8000/dashboard
```

### Login
- **Username:** `admin` (aus deiner `.env`)
- **Password:** `SecurePassword123` (aus deiner `.env`)

### Features
- 📊 **Übersicht** - Umsatz, Bestellungen, Top-Produkte
- 📦 **Produkte** - Hinzufügen, Bearbeiten, Löschen, Stock verwalten
- 🛒 **Bestellungen** - Anzeigen, Status ändern, Details sehen
- 👥 **Kunden** - Alle Telegram-Nutzer + Bestellhistorie

---

## 📁 Projekt Struktur

```
OFFICIALNEBULA/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── telegram-bot.service.js   # Verification Bot
│   │   │   └── shop-bot.service.js       # E-Commerce Bot ⭐
│   │   ├── routes/                        # API Endpoints
│   │   ├── controllers/                   # Business Logic
│   │   └── server.js                      # Main Server
│   ├── prisma/
│   │   └── schema.prisma                  # Database Schema
│   ├── package.json
│   └── quick-start.ps1                    # Setup Script
│
├── dashboard/                              # Admin Dashboard ⭐
│   ├── index.html                          # UI
│   ├── styles.css                          # Glassmorphism Design
│   └── app.js                              # Dashboard Logic
│
└── README.md                               # This file
```

---

## 🎨 Screenshots

### Telegram Bot
```
🛍️ NEBULA SUPPLY

Wähle eine Kategorie:
🏷️ Streetwear
🏷️ Vapes
🏷️ Accessoires

[🛒 Warenkorb]  [🏠 Hauptmenü]
```

### Admin Dashboard
![Dashboard](https://via.placeholder.com/800x400/667eea/ffffff?text=Premium+Glassmorphism+Dashboard)

---

## 🔧 Development

### Database Migrations
```bash
npm run db:migrate      # Run migrations
npm run db:generate     # Generate Prisma Client
npm run db:studio       # Open Prisma Studio (DB GUI)
npm run db:seed         # Seed with test data
```

### Commands
```bash
npm start               # Start server
npm run dev             # Start with auto-reload
```

---

## 🚀 Deployment

### Vercel (Empfohlen)

1. Push zu GitHub
2. Verbinde Repo mit Vercel
3. Environment Variables in Vercel setzen:
   - `DATABASE_URL`
   - `TELEGRAM_BOT_TOKEN`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. Deploy!

**Wichtig:** Bot läuft in Production mit Webhooks (kein Polling)

---

## 📚 Dokumentation

- 📖 [Setup Guide](./brain/.../SETUP_GUIDE.md) - Detaillierte Anleitung
- 🎯 [Walkthrough](./brain/.../walkthrough.md) - Implementation Details
- ✅ [Task List](./brain/.../task.md) - Entwicklungs-Status

---

## ❓ Troubleshooting

### Bot antwortet nicht?
✅ Check `TELEGRAM_BOT_TOKEN` in `.env`  
✅ Server neu starten  
✅ `/start` im Bot schicken

### Dashboard Login klappt nicht?
✅ Check `ADMIN_USERNAME` und `ADMIN_PASSWORD` in `.env`  
✅ Browser Cache leeren  
✅ Server läuft auf Port 8000?

### Keine Produkte im Bot?
✅ Produkte über Dashboard hinzufügen  
✅ `in_stock: true` und `stock > 0` setzen  
✅ Kategorie zuweisen

### Dependencies Installation Error?
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Roadmap

- [ ] Telegram Payments Integration
- [ ] Email Benachrichtigungen
- [ ] Promo Codes / Rabatte
- [ ] Produktbilder Upload
- [ ] Multi-Language Support
- [ ] Analytics Dashboard
- [ ] WhatsApp Bot Integration
- [ ] Versandkosten-Rechner

---

## 👨‍💻 Development Notes

**Database Schema:**
- Nutzt bestehendes Prisma Schema
- `CartItem` für Warenkorb
- `Request` für Bestellungen (statt Order)
- Neues Feld: `Product.stock` für Inventory

**Bot Architecture:**
- 2 separate Bots (Verification + Shop) laufen parallel
- Telegraf mit Scenes für State Management
- Session für User Context
- Graceful Shutdown Support

**Dashboard:**
- Zero Dependencies Frontend
- Custom Glassmorphism CSS
- JWT Auth mit localStorage
- RESTful API Calls

---

## 📝 License

ISC

---

## 🙏 Support

Bei Fragen oder Problemen:
1. Check die [Setup Guide](./brain/.../SETUP_GUIDE.md)
2. Check Server Logs: `npm start`
3. Database checken: `npm run db:studio`

---

**Made with 🔥 for NEBULA SUPPLY**

**Status: Production Ready! 🚀**
