#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const optional = [
  'DIRECT_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'POSTGRES_URL_NON_POOLING',
];

console.log('Environment variable check');
// Show effective DB URL resolution order
const rawDb = process.env.DATABASE_URL;
const mappedFrom = !rawDb
  ? ['POSTGRES_PRISMA_URL', 'POSTGRES_URL', 'POSTGRES_URL_NON_POOLING'].find(
      (k) => process.env[k]
    )
  : null;
if (mappedFrom) {
  console.log(
    `DATABASE_URL will be sourced from ${mappedFrom} at runtime (fallback mapping).`
  );
}
for (const key of required) {
  const val = process.env[key];
  console.log(`${key}: ${val ? 'SET' : 'MISSING'}`);
}
for (const key of optional) {
  const val = process.env[key];
  console.log(`${key}: ${val ? 'SET (optional)' : 'not set (optional)'}`);
}

// Warn if .env.local missing
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log(
    '\n⚠️  .env.local not found. Copy .env.example to .env.local and fill values.'
  );
} else {
  console.log('\n✅ .env.local present.');
}
