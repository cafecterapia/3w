#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Minimal .env loader (no external dependency). Loads .env.local then .env without overriding existing values.
function loadEnvFiles() {
  const cwd = process.cwd();
  const files = ['.env.local', '.env'];
  const loaded = [];
  for (const file of files) {
    const p = path.join(cwd, file);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
    loaded.push(file);
  }
  return loaded;
}

const loadedFiles = loadEnvFiles();

const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const requiredEfi = [
  'EFI_CLIENT_ID',
  'EFI_CLIENT_SECRET',
  'EFI_ENVIRONMENT',
  'EFI_PAYEE_CODE',
];
const optional = [
  'DIRECT_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'POSTGRES_URL_NON_POOLING',
];

console.log('Environment variable check');
if (loadedFiles.length) {
  console.log(`Loaded env files: ${loadedFiles.join(', ')}`);
}
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
console.log('\nEFI configuration');
for (const key of requiredEfi) {
  const val = process.env[key];
  console.log(`${key}: ${val ? 'SET' : 'MISSING'}`);
}
console.log(
  `EFI certificate: ` +
    (process.env.EFI_CERTIFICATE_BASE64
      ? 'using EFI_CERTIFICATE_BASE64'
      : process.env.EFI_CERTIFICATE_PATH
        ? `path ${process.env.EFI_CERTIFICATE_PATH}`
        : 'not provided')
);
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
