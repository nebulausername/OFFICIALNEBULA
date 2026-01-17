import { PrismaClient } from '@prisma/client';

// Prüfe ob SQLite oder PostgreSQL verwendet wird
const isSQLite = process.env.DATABASE_PROVIDER === 'sqlite' || 
                 !process.env.DATABASE_URL?.includes('postgresql');

// Optimized Prisma Client with connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Nur bei PostgreSQL die URL aus .env verwenden
  // Bei SQLite wird die URL aus schema.prisma verwendet
  datasources: isSQLite ? undefined : {
    db: {
      url: process.env.DATABASE_URL,
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
