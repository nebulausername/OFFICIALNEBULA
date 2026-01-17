import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/api';

// Supported locales configuration
export const SUPPORTED_LOCALES = {
  de: { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  sk: { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', dir: 'ltr' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl', isRTL: true }
};

export const DEFAULT_LOCALE = 'de';
const STORAGE_KEY = 'app_locale';

// Translations store
const translations = {
  de: {
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.close': 'Schließen',
    'common.search': 'Suchen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.submit': 'Absenden',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.all': 'Alle',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    
    // Navigation
    'nav.home': 'Startseite',
    'nav.shop': 'Shop',
    'nav.cart': 'Warenkorb',
    'nav.wishlist': 'Merkliste',
    'nav.profile': 'Profil',
    'nav.vip': 'VIP',
    'nav.support': 'Support',
    'nav.admin': 'Admin',
    
    // Shop
    'shop.title': 'Shop',
    'shop.categories': 'Kategorien',
    'shop.filters': 'Filter',
    'shop.sort': 'Sortieren',
    'shop.products': 'Produkte',
    'shop.noProducts': 'Keine Produkte gefunden',
    'shop.searchPlaceholder': 'Suche nach Produkt, Marke, Kategorie…',
    'shop.available': 'Verfügbar',
    'shop.soldOut': 'Ausverkauft',
    'shop.addToCart': 'In den Warenkorb',
    'shop.quickView': 'Quick View',
    'shop.allProducts': 'Alle Produkte',
    'shop.filterApplied': 'Filter angewendet',
    'shop.resetFilters': 'Filter zurücksetzen',
    'shop.productsFound': '{count} Produkte gefunden',
    'shop.priceRange': 'Preisbereich',
    'shop.brands': 'Marken',
    'shop.sizes': 'Größen',
    'shop.colors': 'Farben',
    'shop.inStock': 'Auf Lager',
    
    // Product
    'product.details': 'Produktdetails',
    'product.description': 'Beschreibung',
    'product.shipping': 'Versand',
    'product.quantity': 'Anzahl',
    'product.size': 'Größe',
    'product.color': 'Farbe',
    'product.sku': 'Artikelnummer',
    'product.delivery': 'Lieferung',
    'product.deliveryFrom': 'Lieferbar aus {location}',
    'product.deliveryTime': '{min}–{max} Werktage',
    
    // Cart
    'cart.title': 'Warenkorb',
    'cart.empty': 'Dein Warenkorb ist leer',
    'cart.total': 'Gesamt',
    'cart.checkout': 'Zur Kasse',
    'cart.remove': 'Entfernen',
    'cart.continueShopping': 'Weiter einkaufen',
    
    // Wishlist
    'wishlist.title': 'Merkliste',
    'wishlist.empty': 'Deine Merkliste ist leer',
    'wishlist.addedToWishlist': 'Zur Merkliste hinzugefügt',
    'wishlist.removedFromWishlist': 'Von Merkliste entfernt',
    
    // Auth
    'auth.login': 'Anmelden',
    'auth.logout': 'Abmelden',
    'auth.register': 'Registrieren',
    
    // Language
    'language.title': 'Sprache / Language',
    'language.select': 'Sprache wählen',
    'language.missing': 'Deine Sprache fehlt?',
    'language.missingSubtitle': 'Fordere deine Sprache an – wir prüfen & fügen sie hinzu.',
    'language.request': 'Sprache anfragen',
    'language.requestTitle': 'Sprache anfragen',
    'language.requestLanguage': 'Welche Sprache?',
    'language.requestRegion': 'Region (optional)',
    'language.requestComment': 'Warum brauchst du sie? (optional)',
    'language.requestEmail': 'E-Mail für Rückmeldung',
    'language.requestSubmit': 'Anfrage senden',
    'language.requestSuccess': 'Danke! Wir melden uns, sobald die Sprache verfügbar ist.',
    'language.requestError': 'Fehler beim Senden. Bitte versuche es erneut.',
    'language.searchPlaceholder': 'Sprache suchen…',
    'language.rtl': 'RTL',
    
    // VIP
    'vip.title': 'VIP Club',
    'vip.become': 'VIP werden',
    'vip.benefits': 'VIP Vorteile',
    'vip.priority': 'VIP Priorität',
    
    // Support
    'support.title': 'Support',
    'support.center': 'Support Center',
    'support.helpText': 'Wir helfen dir weiter',
    'support.newTicket': 'Neues Ticket',
    'support.createTicket': 'Ticket erstellen',
    'support.myTickets': 'Meine Tickets',
    'support.new': 'Neu',
    'support.openTickets': 'Offene Tickets',
    'support.vipUnlimited': 'VIP: Unbegrenzt',
    'support.limitReached': 'Limit erreicht',
    'support.backToProfile': 'Zurück zum Profil',
    'support.faq': 'FAQ',
    'support.frequentQuestions': 'Häufige Fragen',
    'support.quickAnswers': 'Schnelle Antworten auf die wichtigsten Fragen',
    'support.noResults': 'Keine Ergebnisse',
    'support.tryOtherSearch': 'Versuche einen anderen Suchbegriff oder erstelle ein Ticket',
    'support.notFound': 'Nicht gefunden?',
    'support.weHelpYou': 'Erstelle ein Ticket und wir helfen dir weiter',
    'support.searchTickets': 'Tickets durchsuchen...',
    'support.searchQuestions': 'Frage durchsuchen...',
    'support.allStatus': 'Alle Status',
    'support.allCategories': 'Alle Kategorien',
    'support.noTickets': 'Noch keine Tickets',
    'support.createFirst': 'Erstelle dein erstes Support-Ticket',
    
    // Ticket Status
    'support.status.open': 'Offen',
    'support.status.inProgress': 'In Bearbeitung',
    'support.status.waitingForYou': 'Wartet auf dich',
    'support.status.solved': 'Gelöst',
    'support.status.closed': 'Geschlossen',
    
    // Ticket Categories
    'support.category.order': 'Bestellung',
    'support.category.payment': 'Zahlung',
    'support.category.product': 'Produkt',
    'support.category.return': 'Retoure',
    'support.category.delivery': 'Lieferung',
    'support.category.technical': 'Technik',
    'support.category.languageRequest': 'Sprache anfragen',
    'support.category.other': 'Sonstiges',
    
    // Ticket Form
    'support.form.category': 'Kategorie',
    'support.form.subject': 'Betreff',
    'support.form.subjectPlaceholder': 'Worum geht es?',
    'support.form.message': 'Nachricht',
    'support.form.messagePlaceholder': 'Beschreibe dein Anliegen...',
    'support.form.fillRequired': 'Bitte alle Pflichtfelder ausfüllen',
    'support.form.orderNumber': 'Bestellnummer',
    'support.form.orderPlaceholder': 'z.B. #12345',
    'support.form.sku': 'Artikelnummer (SKU)',
    'support.form.attachments': 'Anhänge',
    'support.form.uploadFiles': 'Dateien hochladen',
    'support.form.optional': '(optional)',
    'support.form.required': '*',
    'support.form.creating': 'Erstellen...',
    
    // Ticket Chat
    'support.chat.supportTeam': 'Support Team',
    'support.chat.you': 'Du',
    'support.chat.writeMessage': 'Nachricht schreiben...',
    'support.chat.closeTicket': 'Ticket schließen',
    'support.chat.reopenTicket': 'Erneut öffnen',
    'support.chat.problemSolved': 'Problem gelöst',
    'support.chat.needMoreInfo': 'Weitere Infos',
    'support.chat.ticketClosed': 'Ticket geschlossen',
    'support.chat.ticketReopened': 'Ticket wieder geöffnet',
    'support.chat.sendFailed': 'Senden fehlgeschlagen',
    
    // Language Request (special ticket type)
    'support.languageRequest.title': 'Neue Sprache anfragen',
    'support.languageRequest.whichLanguage': 'Welche Sprache möchtest du?',
    'support.languageRequest.selectLanguage': 'Sprache auswählen',
    'support.languageRequest.otherLanguage': 'Andere Sprache',
    'support.languageRequest.scope': 'Wo benötigst du sie?',
    'support.languageRequest.scopeShop': 'Nur im Shop',
    'support.languageRequest.scopeFullApp': 'Komplette App',
    'support.languageRequest.reason': 'Warum brauchst du diese Sprache?',
    
    // Success State
    'support.success.ticketCreated': 'Ticket erstellt',
    'support.success.weContactYou': 'Wir melden uns in Kürze bei dir',
    'support.success.ticketId': 'Ticket-ID',
    'support.success.viewTicket': 'Ticket ansehen',
    
    // FAQ Categories
    'support.faqCategory.all': 'Alle',
    'support.faqCategory.orders': 'Bestellungen',
    'support.faqCategory.payment': 'Zahlung',
    'support.faqCategory.shipping': 'Versand',
    'support.faqCategory.returns': 'Retouren',
    'support.faqCategory.account': 'Konto',
    
    // Profile
    'profile.title': 'Mein Profil',
    'profile.myAccount': 'Mein Konto',
    'profile.accountDescription': 'Persönliche Daten verwalten',
    'profile.settings': 'Profil & Einstellungen',
    'profile.orders': 'Meine Bestellungen',
    'profile.ordersDescription': 'Bestellungen & Status verfolgen',
    'profile.supportTickets': 'Support Tickets',
    'profile.supportTicketsDescription': 'Deine Anfragen & Chat',
    'profile.wishlistDescription': 'Deine Favoriten',
    'profile.vipProgram': 'VIP Programm',
    'profile.vipDescription': 'Exklusive Vorteile freischalten',
    'profile.faq': 'FAQ',
    'profile.faqDescription': 'Häufig gestellte Fragen',
    'profile.helpSupport': 'Hilfe & Support',
    'profile.helpDescription': 'Wir helfen dir weiter',
    'profile.adminDashboard': 'Admin Dashboard',
    'profile.adminDescription': 'Verwaltung & Einstellungen',
    'profile.quickAccess': 'Schnellzugriff',
    'profile.navigation': 'Navigation',
    'profile.more': 'Mehr',
    'profile.fastSupport': 'Schneller Support',
    'profile.secure': '100% Sicher',
    'profile.premiumQuality': 'Premium Qualität',
    'profile.inCart': 'Im Warenkorb',
    'profile.open': 'offen',
    'profile.administrator': 'Administrator',
    'profile.vipMember': 'VIP MITGLIED',
    'profile.vipBenefitsActive': 'Exklusive Vorteile aktiv',
    
    // Footer
    'footer.copyright': '© 2026 Nebula Supply. Premium Quality.',
    'footer.imprint': 'Impressum',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    
    // Misc
    'misc.premiumDrops': 'Premium Drops • Authentisch • Limitiert',
    'misc.discoverPremium': 'Entdecke unsere Premium-Auswahl',
    'misc.newArrivals': 'Neu eingetroffen',
    'misc.bestsellers': 'Bestseller',
    'misc.vipExclusive': 'VIP Exklusiv',
    'misc.shippingFrom': 'Versand aus',
    'misc.deliveryTime': 'Lieferzeit',
    'misc.days': 'Tage',
    'misc.businessDays': 'Werktage',
    
    // Product Quick View
    'product.selectColor': 'Farbe',
    'product.selectSize': 'Größe',
    'product.pleaseSelect': 'Bitte wählen',
    'product.pleaseSelectSize': 'Bitte wähle eine Größe aus',
    'product.deliveryTo': 'Lieferung nach',
    'product.freeShippingFrom': 'Gratis Versand ab',
    'product.added': 'Hinzugefügt!',
    'product.adding': 'Wird hinzugefügt...',
    'product.saved': 'Gemerkt',
    'product.save': 'Merken',
    'product.viewDetails': 'Details',
    'product.buyNow': 'Jetzt kaufen',
    'product.deliverableFrom': 'Lieferbar aus',
    'product.china': 'China',
    'product.germany': 'Deutschland'
  },
  
  en: {
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.all': 'All',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.profile': 'Profile',
    'nav.vip': 'VIP',
    'nav.support': 'Support',
    'nav.admin': 'Admin',
    
    'shop.title': 'Shop',
    'shop.categories': 'Categories',
    'shop.filters': 'Filters',
    'shop.sort': 'Sort',
    'shop.products': 'Products',
    'shop.noProducts': 'No products found',
    'shop.searchPlaceholder': 'Search for product, brand, category…',
    'shop.available': 'Available',
    'shop.soldOut': 'Sold Out',
    'shop.addToCart': 'Add to Cart',
    'shop.quickView': 'Quick View',
    'shop.allProducts': 'All Products',
    'shop.filterApplied': 'Filter applied',
    'shop.resetFilters': 'Reset filters',
    'shop.productsFound': '{count} products found',
    'shop.priceRange': 'Price Range',
    'shop.brands': 'Brands',
    'shop.sizes': 'Sizes',
    'shop.colors': 'Colors',
    'shop.inStock': 'In Stock',
    
    'product.details': 'Product Details',
    'product.description': 'Description',
    'product.shipping': 'Shipping',
    'product.quantity': 'Quantity',
    'product.size': 'Size',
    'product.color': 'Color',
    'product.sku': 'SKU',
    'product.delivery': 'Delivery',
    'product.deliveryFrom': 'Ships from {location}',
    'product.deliveryTime': '{min}–{max} business days',
    
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',
    'cart.continueShopping': 'Continue Shopping',
    
    'wishlist.title': 'Wishlist',
    'wishlist.empty': 'Your wishlist is empty',
    'wishlist.addedToWishlist': 'Added to wishlist',
    'wishlist.removedFromWishlist': 'Removed from wishlist',
    
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    
    'language.title': 'Language',
    'language.select': 'Select Language',
    'language.missing': 'Missing your language?',
    'language.missingSubtitle': 'Request your language – we\'ll review and add it.',
    'language.request': 'Request Language',
    'language.requestTitle': 'Request Language',
    'language.requestLanguage': 'Which language?',
    'language.requestRegion': 'Region (optional)',
    'language.requestComment': 'Why do you need it? (optional)',
    'language.requestEmail': 'Email for feedback',
    'language.requestSubmit': 'Send Request',
    'language.requestSuccess': 'Thanks! We\'ll notify you once the language is available.',
    'language.requestError': 'Error sending request. Please try again.',
    'language.searchPlaceholder': 'Search language…',
    'language.rtl': 'RTL',
    
    'vip.title': 'VIP Club',
    'vip.become': 'Become VIP',
    'vip.benefits': 'VIP Benefits',
    'vip.priority': 'VIP Priority',
    
    'support.title': 'Support',
    'support.center': 'Support Center',
    'support.helpText': 'We\'re here to help',
    'support.newTicket': 'New Ticket',
    'support.createTicket': 'Create Ticket',
    'support.myTickets': 'My Tickets',
    'support.new': 'New',
    'support.openTickets': 'Open Tickets',
    'support.vipUnlimited': 'VIP: Unlimited',
    'support.limitReached': 'Limit reached',
    'support.backToProfile': 'Back to Profile',
    'support.faq': 'FAQ',
    'support.frequentQuestions': 'Frequent Questions',
    'support.quickAnswers': 'Quick answers to the most important questions',
    'support.noResults': 'No results',
    'support.tryOtherSearch': 'Try another search term or create a ticket',
    'support.notFound': 'Not found?',
    'support.weHelpYou': 'Create a ticket and we\'ll help you',
    'support.searchTickets': 'Search tickets...',
    'support.searchQuestions': 'Search questions...',
    'support.allStatus': 'All Status',
    'support.allCategories': 'All Categories',
    'support.noTickets': 'No tickets yet',
    'support.createFirst': 'Create your first support ticket',
    'support.status.open': 'Open',
    'support.status.inProgress': 'In Progress',
    'support.status.waitingForYou': 'Waiting for you',
    'support.status.solved': 'Solved',
    'support.status.closed': 'Closed',
    'support.category.order': 'Order',
    'support.category.payment': 'Payment',
    'support.category.product': 'Product',
    'support.category.return': 'Return',
    'support.category.delivery': 'Delivery',
    'support.category.technical': 'Technical',
    'support.category.languageRequest': 'Request Language',
    'support.category.other': 'Other',
    'support.form.category': 'Category',
    'support.form.subject': 'Subject',
    'support.form.subjectPlaceholder': 'What is it about?',
    'support.form.message': 'Message',
    'support.form.messagePlaceholder': 'Describe your issue...',
    'support.form.orderNumber': 'Order Number',
    'support.form.orderPlaceholder': 'e.g. #12345',
    'support.form.sku': 'SKU',
    'support.form.attachments': 'Attachments',
    'support.form.uploadFiles': 'Upload files',
    'support.form.optional': '(optional)',
    'support.form.required': '*',
    'support.form.creating': 'Creating...',
    'support.form.fillRequired': 'Please fill all required fields',
    'support.chat.supportTeam': 'Support Team',
    'support.chat.you': 'You',
    'support.chat.writeMessage': 'Write a message...',
    'support.chat.closeTicket': 'Close Ticket',
    'support.chat.reopenTicket': 'Reopen',
    'support.chat.problemSolved': 'Problem Solved',
    'support.chat.needMoreInfo': 'Need More Info',
    'support.chat.ticketClosed': 'Ticket closed',
    'support.chat.ticketReopened': 'Ticket reopened',
    'support.chat.sendFailed': 'Send failed',
    'support.languageRequest.title': 'Request New Language',
    'support.languageRequest.whichLanguage': 'Which language do you need?',
    'support.languageRequest.selectLanguage': 'Select language',
    'support.languageRequest.otherLanguage': 'Other language',
    'support.languageRequest.scope': 'Where do you need it?',
    'support.languageRequest.scopeShop': 'Shop only',
    'support.languageRequest.scopeFullApp': 'Full app',
    'support.languageRequest.reason': 'Why do you need this language?',
    'support.success.ticketCreated': 'Ticket created',
    'support.success.weContactYou': 'We\'ll get back to you shortly',
    'support.success.ticketId': 'Ticket ID',
    'support.success.viewTicket': 'View Ticket',
    'support.faqCategory.all': 'All',
    'support.faqCategory.orders': 'Orders',
    'support.faqCategory.payment': 'Payment',
    'support.faqCategory.shipping': 'Shipping',
    'support.faqCategory.returns': 'Returns',
    'support.faqCategory.account': 'Account',
    
    'profile.title': 'My Profile',
    'profile.myAccount': 'My Account',
    'profile.accountDescription': 'Manage personal data',
    'profile.settings': 'Profile & Settings',
    'profile.orders': 'My Orders',
    'profile.ordersDescription': 'Track orders & status',
    'profile.supportTickets': 'Support Tickets',
    'profile.supportTicketsDescription': 'Your inquiries & chat',
    'profile.wishlistDescription': 'Your favorites',
    'profile.vipProgram': 'VIP Program',
    'profile.vipDescription': 'Unlock exclusive benefits',
    'profile.faq': 'FAQ',
    'profile.faqDescription': 'Frequently asked questions',
    'profile.helpSupport': 'Help & Support',
    'profile.helpDescription': 'We\'re here to help',
    'profile.adminDashboard': 'Admin Dashboard',
    'profile.adminDescription': 'Management & settings',
    'profile.quickAccess': 'Quick Access',
    'profile.navigation': 'Navigation',
    'profile.more': 'More',
    'profile.fastSupport': 'Fast Support',
    'profile.secure': '100% Secure',
    'profile.premiumQuality': 'Premium Quality',
    'profile.inCart': 'In Cart',
    'profile.open': 'open',
    'profile.administrator': 'Administrator',
    'profile.vipMember': 'VIP MEMBER',
    'profile.vipBenefitsActive': 'Exclusive benefits active',
    
    'footer.copyright': '© 2026 Nebula Supply. Premium Quality.',
    'footer.imprint': 'Imprint',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    
    'misc.premiumDrops': 'Premium Drops • Authentic • Limited',
    'misc.discoverPremium': 'Discover our premium selection',
    'misc.newArrivals': 'New Arrivals',
    'misc.bestsellers': 'Bestsellers',
    'misc.vipExclusive': 'VIP Exclusive',
    'misc.shippingFrom': 'Ships from',
    'misc.deliveryTime': 'Delivery time',
    'misc.days': 'days',
    'misc.businessDays': 'business days',
    
    'product.selectColor': 'Color',
    'product.selectSize': 'Size',
    'product.pleaseSelect': 'Please select',
    'product.pleaseSelectSize': 'Please select a size',
    'product.deliveryTo': 'Delivery to',
    'product.freeShippingFrom': 'Free shipping from',
    'product.added': 'Added!',
    'product.adding': 'Adding...',
    'product.saved': 'Saved',
    'product.save': 'Save',
    'product.viewDetails': 'Details',
    'product.buyNow': 'Buy Now',
    'product.deliverableFrom': 'Ships from',
    'product.china': 'China',
    'product.germany': 'Germany'
  },
  
  sk: {
    'common.loading': 'Načítava sa...',
    'common.save': 'Uložiť',
    'common.cancel': 'Zrušiť',
    'common.close': 'Zavrieť',
    'common.search': 'Hľadať',
    'common.back': 'Späť',
    'common.next': 'Ďalej',
    'common.submit': 'Odoslať',
    'common.delete': 'Vymazať',
    'common.edit': 'Upraviť',
    'common.all': 'Všetko',
    'common.yes': 'Áno',
    'common.no': 'Nie',
    
    'nav.home': 'Domov',
    'nav.shop': 'Obchod',
    'nav.cart': 'Košík',
    'nav.wishlist': 'Obľúbené',
    'nav.profile': 'Profil',
    'nav.vip': 'VIP',
    'nav.support': 'Podpora',
    'nav.admin': 'Admin',
    
    'shop.title': 'Obchod',
    'shop.categories': 'Kategórie',
    'shop.filters': 'Filtre',
    'shop.sort': 'Zoradiť',
    'shop.products': 'Produkty',
    'shop.noProducts': 'Žiadne produkty',
    'shop.searchPlaceholder': 'Hľadať produkt, značku, kategóriu…',
    'shop.available': 'Dostupné',
    'shop.soldOut': 'Vypredané',
    'shop.addToCart': 'Do košíka',
    'shop.quickView': 'Rýchly náhľad',
    'shop.allProducts': 'Všetky produkty',
    'shop.filterApplied': 'Filter použitý',
    'shop.resetFilters': 'Resetovať filtre',
    'shop.productsFound': '{count} produktov nájdených',
    'shop.priceRange': 'Cenové rozpätie',
    'shop.brands': 'Značky',
    'shop.sizes': 'Veľkosti',
    'shop.colors': 'Farby',
    'shop.inStock': 'Na sklade',
    
    'product.details': 'Detail produktu',
    'product.description': 'Popis',
    'product.shipping': 'Doručenie',
    'product.quantity': 'Množstvo',
    'product.size': 'Veľkosť',
    'product.color': 'Farba',
    'product.sku': 'SKU',
    'product.delivery': 'Doručenie',
    'product.deliveryFrom': 'Odosielame z {location}',
    'product.deliveryTime': '{min}–{max} pracovných dní',
    
    'cart.title': 'Nákupný košík',
    'cart.empty': 'Váš košík je prázdny',
    'cart.total': 'Celkom',
    'cart.checkout': 'K pokladni',
    'cart.remove': 'Odstrániť',
    'cart.continueShopping': 'Pokračovať v nákupe',
    
    'wishlist.title': 'Obľúbené',
    'wishlist.empty': 'Nemáte obľúbené položky',
    'wishlist.addedToWishlist': 'Pridané do obľúbených',
    'wishlist.removedFromWishlist': 'Odstránené z obľúbených',
    
    'auth.login': 'Prihlásiť',
    'auth.logout': 'Odhlásiť',
    'auth.register': 'Registrovať',
    
    'language.title': 'Jazyk',
    'language.select': 'Vybrať jazyk',
    'language.missing': 'Chýba váš jazyk?',
    'language.missingSubtitle': 'Požiadajte o jazyk – skontrolujeme a pridáme ho.',
    'language.request': 'Požiadať o jazyk',
    'language.requestTitle': 'Požiadať o jazyk',
    'language.requestLanguage': 'Aký jazyk?',
    'language.requestRegion': 'Región (voliteľné)',
    'language.requestComment': 'Prečo ho potrebujete? (voliteľné)',
    'language.requestEmail': 'Email pre spätnú väzbu',
    'language.requestSubmit': 'Odoslať žiadosť',
    'language.requestSuccess': 'Ďakujeme! Dáme vám vedieť, keď bude jazyk dostupný.',
    'language.requestError': 'Chyba pri odosielaní. Skúste znova.',
    'language.searchPlaceholder': 'Hľadať jazyk…',
    'language.rtl': 'RTL',
    
    'vip.title': 'VIP Klub',
    'vip.become': 'Staň sa VIP',
    'vip.benefits': 'VIP výhody',
    'vip.priority': 'VIP priorita',
    
    'support.title': 'Podpora',
    'support.center': 'Centrum podpory',
    'support.helpText': 'Sme tu pre vás',
    'support.newTicket': 'Nový tiket',
    'support.createTicket': 'Vytvoriť tiket',
    'support.myTickets': 'Moje tikety',
    'support.new': 'Nové',
    'support.openTickets': 'Otvorené tikety',
    'support.vipUnlimited': 'VIP: Neobmedzene',
    'support.limitReached': 'Limit dosiahnutý',
    'support.backToProfile': 'Späť na profil',
    'support.faq': 'FAQ',
    'support.noTickets': 'Zatiaľ žiadne tikety',
    'support.createFirst': 'Vytvorte svoj prvý tiket',
    'support.status.open': 'Otvorené',
    'support.status.inProgress': 'V riešení',
    'support.status.waitingForYou': 'Čaká na vás',
    'support.status.solved': 'Vyriešené',
    'support.status.closed': 'Zatvorené',
    'support.category.order': 'Objednávka',
    'support.category.payment': 'Platba',
    'support.category.product': 'Produkt',
    'support.category.return': 'Vrátenie',
    'support.category.delivery': 'Doručenie',
    'support.category.technical': 'Technické',
    'support.category.languageRequest': 'Žiadosť o jazyk',
    'support.category.other': 'Ostatné',
    'support.form.category': 'Kategória',
    'support.form.subject': 'Predmet',
    'support.form.message': 'Správa',
    'support.form.attachments': 'Prílohy',
    'support.chat.supportTeam': 'Tím podpory',
    'support.chat.you': 'Ty',
    'support.chat.writeMessage': 'Napísať správu...',
    'support.chat.closeTicket': 'Zatvoriť tiket',
    'support.chat.reopenTicket': 'Znovu otvoriť',
    'support.success.ticketCreated': 'Tiket vytvorený',
    'support.success.viewTicket': 'Zobraziť tiket',
    
    'profile.title': 'Môj profil',
    'profile.myAccount': 'Môj účet',
    'profile.accountDescription': 'Spravovať osobné údaje',
    'profile.settings': 'Profil & Nastavenia',
    'profile.orders': 'Moje objednávky',
    'profile.ordersDescription': 'Sledovať objednávky & stav',
    'profile.supportTickets': 'Tikety podpory',
    'profile.supportTicketsDescription': 'Vaše dotazy & chat',
    'profile.wishlistDescription': 'Vaše obľúbené',
    'profile.vipProgram': 'VIP Program',
    'profile.vipDescription': 'Odomknúť exkluzívne výhody',
    'profile.faq': 'FAQ',
    'profile.faqDescription': 'Často kladené otázky',
    'profile.helpSupport': 'Pomoc & Podpora',
    'profile.helpDescription': 'Sme tu pre vás',
    'profile.adminDashboard': 'Admin Panel',
    'profile.adminDescription': 'Správa & nastavenia',
    'profile.quickAccess': 'Rýchly prístup',
    'profile.navigation': 'Navigácia',
    'profile.more': 'Viac',
    'profile.fastSupport': 'Rýchla podpora',
    'profile.secure': '100% Bezpečné',
    'profile.premiumQuality': 'Prémiová kvalita',
    'profile.inCart': 'V košíku',
    'profile.open': 'otvorené',
    'profile.administrator': 'Administrátor',
    'profile.vipMember': 'VIP ČLEN',
    'profile.vipBenefitsActive': 'Exkluzívne výhody aktívne',
    
    'footer.copyright': '© 2026 Nebula Supply. Prémiová kvalita.',
    'footer.imprint': 'Impressum',
    'footer.privacy': 'Ochrana údajov',
    'footer.terms': 'Podmienky',
    
    'misc.premiumDrops': 'Premium Drops • Autentické • Limitované',
    'misc.discoverPremium': 'Objavte našu prémiovú ponuku',
    'misc.newArrivals': 'Novinky',
    'misc.bestsellers': 'Bestsellery',
    'misc.vipExclusive': 'VIP Exkluzívne',
    'misc.shippingFrom': 'Odosielame z',
    'misc.deliveryTime': 'Doba doručenia',
    'misc.days': 'dní',
    'misc.businessDays': 'pracovných dní',
    
    'product.selectColor': 'Farba',
    'product.selectSize': 'Veľkosť',
    'product.pleaseSelect': 'Prosím vyberte',
    'product.pleaseSelectSize': 'Prosím vyberte veľkosť',
    'product.deliveryTo': 'Doručenie do',
    'product.freeShippingFrom': 'Doprava zadarmo od',
    'product.added': 'Pridané!',
    'product.adding': 'Pridávam...',
    'product.saved': 'Uložené',
    'product.save': 'Uložiť',
    'product.viewDetails': 'Detaily',
    'product.buyNow': 'Kúpiť teraz',
    'product.deliverableFrom': 'Odosielame z',
    'product.china': 'Čína',
    'product.germany': 'Nemecko'
  },
  
  ar: {
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.search': 'بحث',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.submit': 'إرسال',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.all': 'الكل',
    'common.yes': 'نعم',
    'common.no': 'لا',
    
    'nav.home': 'الرئيسية',
    'nav.shop': 'المتجر',
    'nav.cart': 'السلة',
    'nav.wishlist': 'المفضلة',
    'nav.profile': 'الملف الشخصي',
    'nav.vip': 'VIP',
    'nav.support': 'الدعم',
    'nav.admin': 'الإدارة',
    
    'shop.title': 'المتجر',
    'shop.categories': 'الفئات',
    'shop.filters': 'الفلاتر',
    'shop.sort': 'ترتيب',
    'shop.products': 'المنتجات',
    'shop.noProducts': 'لم يتم العثور على منتجات',
    'shop.searchPlaceholder': 'ابحث عن منتج، علامة تجارية، فئة…',
    'shop.available': 'متوفر',
    'shop.soldOut': 'نفذ',
    'shop.addToCart': 'أضف للسلة',
    'shop.quickView': 'عرض سريع',
    'shop.allProducts': 'جميع المنتجات',
    'shop.filterApplied': 'تم تطبيق الفلتر',
    'shop.resetFilters': 'إعادة تعيين الفلاتر',
    'shop.productsFound': 'تم العثور على {count} منتج',
    'shop.priceRange': 'نطاق السعر',
    'shop.brands': 'العلامات التجارية',
    'shop.sizes': 'المقاسات',
    'shop.colors': 'الألوان',
    'shop.inStock': 'متوفر',
    
    'product.details': 'تفاصيل المنتج',
    'product.description': 'الوصف',
    'product.shipping': 'الشحن',
    'product.quantity': 'الكمية',
    'product.size': 'المقاس',
    'product.color': 'اللون',
    'product.sku': 'رمز المنتج',
    'product.delivery': 'التوصيل',
    'product.deliveryFrom': 'يُشحن من {location}',
    'product.deliveryTime': '{min}–{max} أيام عمل',
    
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.total': 'المجموع',
    'cart.checkout': 'الدفع',
    'cart.remove': 'إزالة',
    'cart.continueShopping': 'متابعة التسوق',
    
    'wishlist.title': 'المفضلة',
    'wishlist.empty': 'قائمة المفضلة فارغة',
    'wishlist.addedToWishlist': 'أضيف للمفضلة',
    'wishlist.removedFromWishlist': 'أزيل من المفضلة',
    
    'auth.login': 'تسجيل الدخول',
    'auth.logout': 'تسجيل الخروج',
    'auth.register': 'تسجيل',
    
    'language.title': 'اللغة',
    'language.select': 'اختر اللغة',
    'language.missing': 'لغتك غير متوفرة؟',
    'language.missingSubtitle': 'اطلب لغتك – سنراجع ونضيفها.',
    'language.request': 'طلب لغة',
    'language.requestTitle': 'طلب لغة',
    'language.requestLanguage': 'أي لغة؟',
    'language.requestRegion': 'المنطقة (اختياري)',
    'language.requestComment': 'لماذا تحتاجها؟ (اختياري)',
    'language.requestEmail': 'البريد الإلكتروني للرد',
    'language.requestSubmit': 'إرسال الطلب',
    'language.requestSuccess': 'شكراً! سنبلغك عندما تتوفر اللغة.',
    'language.requestError': 'خطأ في الإرسال. حاول مرة أخرى.',
    'language.searchPlaceholder': 'ابحث عن لغة…',
    'language.rtl': 'RTL',
    
    'vip.title': 'نادي VIP',
    'vip.become': 'كن VIP',
    'vip.benefits': 'مزايا VIP',
    'vip.priority': 'أولوية VIP',
    
    'support.title': 'الدعم',
    'support.center': 'مركز الدعم',
    'support.helpText': 'نحن هنا لمساعدتك',
    'support.newTicket': 'تذكرة جديدة',
    'support.createTicket': 'إنشاء تذكرة',
    'support.myTickets': 'تذاكري',
    'support.new': 'جديد',
    'support.openTickets': 'التذاكر المفتوحة',
    'support.vipUnlimited': 'VIP: غير محدود',
    'support.limitReached': 'تم الوصول للحد',
    'support.backToProfile': 'العودة للملف الشخصي',
    'support.faq': 'الأسئلة الشائعة',
    'support.noTickets': 'لا توجد تذاكر بعد',
    'support.createFirst': 'أنشئ أول تذكرة دعم',
    'support.status.open': 'مفتوح',
    'support.status.inProgress': 'قيد المعالجة',
    'support.status.waitingForYou': 'في انتظارك',
    'support.status.solved': 'تم الحل',
    'support.status.closed': 'مغلق',
    'support.category.order': 'الطلب',
    'support.category.payment': 'الدفع',
    'support.category.product': 'المنتج',
    'support.category.return': 'الإرجاع',
    'support.category.delivery': 'التوصيل',
    'support.category.technical': 'تقني',
    'support.category.languageRequest': 'طلب لغة',
    'support.category.other': 'أخرى',
    'support.form.category': 'الفئة',
    'support.form.subject': 'الموضوع',
    'support.form.message': 'الرسالة',
    'support.form.attachments': 'المرفقات',
    'support.chat.supportTeam': 'فريق الدعم',
    'support.chat.you': 'أنت',
    'support.chat.writeMessage': 'اكتب رسالة...',
    'support.chat.closeTicket': 'إغلاق التذكرة',
    'support.chat.reopenTicket': 'إعادة فتح',
    'support.success.ticketCreated': 'تم إنشاء التذكرة',
    'support.success.viewTicket': 'عرض التذكرة',
    
    'profile.title': 'ملفي الشخصي',
    'profile.myAccount': 'حسابي',
    'profile.accountDescription': 'إدارة البيانات الشخصية',
    'profile.settings': 'الملف والإعدادات',
    'profile.orders': 'طلباتي',
    'profile.ordersDescription': 'تتبع الطلبات والحالة',
    'profile.supportTickets': 'تذاكر الدعم',
    'profile.supportTicketsDescription': 'استفساراتك والدردشة',
    'profile.wishlistDescription': 'المفضلة لديك',
    'profile.vipProgram': 'برنامج VIP',
    'profile.vipDescription': 'فتح المزايا الحصرية',
    'profile.faq': 'الأسئلة الشائعة',
    'profile.faqDescription': 'الأسئلة المتكررة',
    'profile.helpSupport': 'المساعدة والدعم',
    'profile.helpDescription': 'نحن هنا للمساعدة',
    'profile.adminDashboard': 'لوحة الإدارة',
    'profile.adminDescription': 'الإدارة والإعدادات',
    'profile.quickAccess': 'الوصول السريع',
    'profile.navigation': 'التنقل',
    'profile.more': 'المزيد',
    'profile.fastSupport': 'دعم سريع',
    'profile.secure': '100% آمن',
    'profile.premiumQuality': 'جودة فاخرة',
    'profile.inCart': 'في السلة',
    'profile.open': 'مفتوح',
    'profile.administrator': 'مدير',
    'profile.vipMember': 'عضو VIP',
    'profile.vipBenefitsActive': 'المزايا الحصرية مفعلة',
    
    'footer.copyright': '© 2026 Nebula Supply. جودة فاخرة.',
    'footer.imprint': 'البيانات القانونية',
    'footer.privacy': 'الخصوصية',
    'footer.terms': 'الشروط',
    
    'misc.premiumDrops': 'منتجات فاخرة • أصلية • محدودة',
    'misc.discoverPremium': 'اكتشف مجموعتنا الفاخرة',
    'misc.newArrivals': 'وصل حديثاً',
    'misc.bestsellers': 'الأكثر مبيعاً',
    'misc.vipExclusive': 'حصري لـ VIP',
    'misc.shippingFrom': 'الشحن من',
    'misc.deliveryTime': 'وقت التوصيل',
    'misc.days': 'أيام',
    'misc.businessDays': 'أيام عمل',
    
    'product.selectColor': 'اللون',
    'product.selectSize': 'المقاس',
    'product.pleaseSelect': 'يرجى الاختيار',
    'product.pleaseSelectSize': 'يرجى اختيار المقاس',
    'product.deliveryTo': 'التوصيل إلى',
    'product.freeShippingFrom': 'شحن مجاني من',
    'product.added': 'تمت الإضافة!',
    'product.adding': 'جاري الإضافة...',
    'product.saved': 'محفوظ',
    'product.save': 'حفظ',
    'product.viewDetails': 'التفاصيل',
    'product.buyNow': 'اشتري الآن',
    'product.deliverableFrom': 'يُشحن من',
    'product.china': 'الصين',
    'product.germany': 'ألمانيا'
  },
  
  tr: {
    'common.loading': 'Yükleniyor...',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.close': 'Kapat',
    'common.search': 'Ara',
    'common.back': 'Geri',
    'common.next': 'İleri',
    'common.submit': 'Gönder',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.all': 'Tümü',
    'common.yes': 'Evet',
    'common.no': 'Hayır',
    
    'nav.home': 'Ana Sayfa',
    'nav.shop': 'Mağaza',
    'nav.cart': 'Sepet',
    'nav.wishlist': 'Favoriler',
    'nav.profile': 'Profil',
    'nav.vip': 'VIP',
    'nav.support': 'Destek',
    'nav.admin': 'Yönetici',
    
    'shop.title': 'Mağaza',
    'shop.categories': 'Kategoriler',
    'shop.filters': 'Filtreler',
    'shop.sort': 'Sırala',
    'shop.products': 'Ürünler',
    'shop.noProducts': 'Ürün bulunamadı',
    'shop.searchPlaceholder': 'Ürün, marka, kategori ara…',
    'shop.available': 'Mevcut',
    'shop.soldOut': 'Tükendi',
    'shop.addToCart': 'Sepete Ekle',
    'shop.quickView': 'Hızlı Bak',
    'shop.allProducts': 'Tüm Ürünler',
    'shop.filterApplied': 'Filtre uygulandı',
    'shop.resetFilters': 'Filtreleri sıfırla',
    'shop.productsFound': '{count} ürün bulundu',
    
    'language.title': 'Dil',
    'language.select': 'Dil Seç',
    'language.missing': 'Diliniz eksik mi?',
    'language.missingSubtitle': 'Dilinizi talep edin – inceleyip ekleyelim.',
    'language.request': 'Dil Talep Et',
    'language.requestTitle': 'Dil Talep Et',
    'language.requestLanguage': 'Hangi dil?',
    'language.requestSubmit': 'Talebi Gönder',
    'language.requestSuccess': 'Teşekkürler! Dil hazır olduğunda size bildireceğiz.',
    'language.requestError': 'Gönderim hatası. Tekrar deneyin.'
  },
  
  fr: {
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.search': 'Rechercher',
    'common.back': 'Retour',
    
    'nav.home': 'Accueil',
    'nav.shop': 'Boutique',
    'nav.cart': 'Panier',
    'nav.wishlist': 'Favoris',
    
    'shop.title': 'Boutique',
    'shop.categories': 'Catégories',
    'shop.available': 'Disponible',
    'shop.soldOut': 'Épuisé',
    'shop.addToCart': 'Ajouter au panier',
    
    'language.title': 'Langue',
    'language.missing': 'Votre langue manque?',
    'language.request': 'Demander une langue'
  },
  
  it: {
    'common.loading': 'Caricamento...',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.close': 'Chiudi',
    
    'nav.home': 'Home',
    'nav.shop': 'Negozio',
    'nav.cart': 'Carrello',
    'nav.wishlist': 'Preferiti',
    
    'shop.title': 'Negozio',
    'shop.categories': 'Categorie',
    'shop.available': 'Disponibile',
    'shop.soldOut': 'Esaurito',
    
    'language.title': 'Lingua',
    'language.missing': 'Manca la tua lingua?',
    'language.request': 'Richiedi lingua'
  },
  
  es: {
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    
    'nav.home': 'Inicio',
    'nav.shop': 'Tienda',
    'nav.cart': 'Carrito',
    'nav.wishlist': 'Favoritos',
    
    'shop.title': 'Tienda',
    'shop.categories': 'Categorías',
    'shop.available': 'Disponible',
    'shop.soldOut': 'Agotado',
    
    'language.title': 'Idioma',
    'language.missing': '¿Falta tu idioma?',
    'language.request': 'Solicitar idioma'
  }
};

// Context
const I18nContext = createContext(null);

// Detect best locale
const detectLocale = () => {
  // 1. Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES[stored]) return stored;
  
  // 2. Check browser languages
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const code = lang.split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES[code]) return code;
  }
  
  // 3. Fallback
  return DEFAULT_LOCALE;
};

// Get unsupported locale candidate
const getUnsupportedCandidate = () => {
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const code = lang.split('-')[0].toLowerCase();
    if (!SUPPORTED_LOCALES[code]) return code;
  }
  return null;
};

// Provider component
export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => detectLocale());
  const [isRTL, setIsRTL] = useState(false);
  const [unsupportedCandidate, setUnsupportedCandidate] = useState(null);

  // Initialize
  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    setUnsupportedCandidate(getUnsupportedCandidate());
    
    // Try to get user preference
    const loadUserPreference = async () => {
      try {
        const user = await api.auth.me();
        if (user?.language && SUPPORTED_LOCALES[user.language]) {
          setLocaleState(user.language);
        }
      } catch (e) {
        // Not logged in or network error - use detected locale
        // Silently fail to prevent console errors
      }
    };
    loadUserPreference();
  }, []);

  // Update document direction and lang
  useEffect(() => {
    const localeConfig = SUPPORTED_LOCALES[locale];
    const rtl = localeConfig?.dir === 'rtl';
    setIsRTL(rtl);
    
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  // Set locale function
  const setLocale = useCallback(async (newLocale) => {
    if (!SUPPORTED_LOCALES[newLocale]) return;
    
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    
    // Save to user profile if logged in
    try {
      await api.auth.updateMe({ language: newLocale });
    } catch (e) {
      // Not logged in or error
    }
  }, []);

  // Translation function
  const t = useCallback((key, params = {}) => {
    let text = translations[locale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key;
    
    // Replace params
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    
    return text;
  }, [locale]);

  // Format currency
  const formatCurrency = useCallback((amount, currency = 'EUR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  }, [locale]);

  // Format date
  const formatDate = useCallback((date, options = {}) => {
    return new Intl.DateTimeFormat(locale, options).format(new Date(date));
  }, [locale]);

  const value = {
    locale,
    setLocale,
    t,
    isRTL,
    formatCurrency,
    formatDate,
    supportedLocales: SUPPORTED_LOCALES,
    unsupportedCandidate
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Export for direct use
export { translations };