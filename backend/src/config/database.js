import { PrismaClient } from '@prisma/client';

// Prüfe ob SQLite oder PostgreSQL verwendet wird
// Auf Vercel MÜSSEN wir Postgres nutzen. Wenn DATABASE_URL fehlt, crashen wir lieber mit Fehler als SQLite zu versuchen.
const isVercel = !!process.env.VERCEL;
const isSQLite = !isVercel && (process.env.DATABASE_PROVIDER === 'sqlite' || !process.env.DATABASE_URL?.includes('postgresql'));

if (isVercel && !process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is missing in Vercel environment variables!');
}

// Optimized Prisma Client with connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: isSQLite ? undefined : {
    db: {
      // Add optimized connection pooling for Supabase
      url: (() => {
        const baseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.SUPABASE_DB_URL;
        if (!baseUrl) return undefined;

        // Add connection pooling parameters if not already present
        const url = new URL(baseUrl);
        if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '10');
        if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '20');
        if (!url.searchParams.has('statement_cache_size')) url.searchParams.set('statement_cache_size', '100');

        return url.toString();
      })(),
    },
  },
  // Connection pool optimization (nur für PostgreSQL relevant)
  __internal: {
    engine: {
      connectTimeout: 20000,
      queryTimeout: 30000,
    },
  },
});

// Connection pool configuration via DATABASE_URL
// Format: postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=20
// These are set via DATABASE_URL query parameters, but we document them here:
// - connection_limit: 10 (max connections in pool)
// - pool_timeout: 20 (seconds to wait for connection)
// - query_timeout: 30 (seconds for query execution)

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
