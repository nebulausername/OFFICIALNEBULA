#!/usr/bin/env node

/**
 * Generates a secure JWT secret
 * Usage: node scripts/generate-jwt-secret.js
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('base64');

console.log('\n✅ JWT Secret generiert:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(secret);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Kopiere diesen Wert in deine .env Datei als JWT_SECRET');
console.log('📋 Oder setze ihn in Vercel als Environment Variable\n');
