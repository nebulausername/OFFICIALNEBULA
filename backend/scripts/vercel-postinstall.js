#!/usr/bin/env node

/**
 * Vercel postinstall hook:
 * - Generates Prisma client
 * - Runs prisma migrate deploy
 *
 * Guarded so it only runs on Vercel builds.
 */

import { spawnSync } from 'child_process';

const isVercel = !!process.env.VERCEL;
const hasDb = !!process.env.DATABASE_URL;

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const run = (args) => {
  const result = spawnSync(npxCmd, ['prisma', ...args], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (!isVercel) {
  process.exit(0);
}

if (!hasDb) {
  console.log('[VERCEL] DATABASE_URL not set; skipping Prisma generate/migrate.');
  process.exit(0);
}

console.log('[VERCEL] Running Prisma generate...');
run(['generate']);

console.log('[VERCEL] Running Prisma migrate deploy...');
run(['migrate', 'deploy']);

