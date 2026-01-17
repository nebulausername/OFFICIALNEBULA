# 🚀 Homepage & Shop Verbesserungsplan

## 📋 Übersicht

Dieser Plan beschreibt die Verbesserungen für die Homepage und Shop-Seite, um sie lebendiger und benutzerfreundlicher zu machen.

## 🎯 Ziele

1. **Homepage lebendiger machen** mit prominenten Kategorien (Herren, Damen, Unisex, Accessoires)
2. **Highlight-Produkte** unter jeder Kategorie anzeigen
3. **Shop-Seite** mit gleicher Produktanzeige wie Homepage
4. **Kategorien und Produkte** hinzufügen/verbessern

## 🔍 Aktuelle Situation

### Homepage (`src/pages/Home.jsx`)
- ✅ Departments-Section vorhanden (Zeile 668-803)
- ✅ CategoryProductsSection vorhanden (Zeile 805-832)
- ✅ Produkte werden pro Department geladen
- ⚠️ Mögliche Probleme beim Laden der Produkte

### Shop (`src/pages/Products.jsx`)
- ✅ Produkt-Grid vorhanden
- ✅ Filter-System vorhanden
- ❌ Keine Department-Gruppierung
- ❌ Keine prominenten Kategorien

## 🛠️ Implementierungsplan

### Phase 1: Datenbank-Seeding verbessern ✅
**Datei:** `backend/prisma/seed.js`
- Sicherstellen, dass für jedes Department mindestens 8-12 Produkte vorhanden sind
- Produkte mit korrekten `department_id` zuweisen
- Cover-Images für alle Produkte setzen

### Phase 2: Homepage optimieren ✅
**Datei:** `src/pages/Home.jsx`
- Kategorien-Section bereits vorhanden
- CategoryProductsSection bereits vorhanden
- Verbesserungen:
  - Besseres Error-Handling
  - Fallback wenn keine Produkte gefunden werden
  - Loading-States verbessern

### Phase 3: Shop-Seite verbessern ✅
**Datei:** `src/pages/Products.jsx`
- Department-Filter hinzufügen
- URL-Parameter `?department=...` unterstützen
- Filter nach Department in ShopControlStrip integrieren

### Phase 4: Produkte hinzufügen ✅
- Über Admin-Panel oder Seed-Script
- Mindestens 8-12 Produkte pro Department

## 📝 Technische Details

### Departments (bereits vorhanden)
1. **Herren** (slug: `herren`, sort_order: 1)
2. **Damen** (slug: `damen`, sort_order: 2)
3. **Unisex** (slug: `unisex`, sort_order: 3)
4. **Accessoires** (slug: `accessoires`, sort_order: 4)

### API-Endpoints
- `GET /api/departments` - Alle Departments
- `GET /api/products?department_id={id}` - Produkte nach Department
- `GET /api/products` - Alle Produkte

## ✅ Checkliste

- [ ] Datenbank-Seeding prüfen und erweitern
- [ ] Homepage Error-Handling verbessern
- [ ] Shop-Seite Department-Filter hinzufügen
- [ ] Produkte für alle Departments hinzufügen
- [ ] Testing durchführen
- [ ] Dokumentation aktualisieren

## 🎨 Design-Anforderungen

- Premium Look & Feel beibehalten
- Gold-Akzente (#D6B25E, #F2D27C)
- Smooth Animations mit Framer Motion
- Responsive Design (Mobile + Desktop)
- Loading States für bessere UX

## 📊 Erfolgs-Metriken

- ✅ Alle 4 Kategorien werden auf Homepage angezeigt
- ✅ Mindestens 8 Produkte pro Kategorie auf Homepage
- ✅ Shop zeigt Produkte korrekt gefiltert an
- ✅ Keine Console-Errors beim Laden
- ✅ Smooth User Experience
