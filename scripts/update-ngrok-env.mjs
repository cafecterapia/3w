#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const envPath = path.resolve(process.cwd(), '.env.local');

async function getNgrokHttpsUrl() {
  try {
    const res = await fetch('http://127.0.0.1:4040/api/tunnels');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const https = (data.tunnels || []).find((t) =>
      t?.public_url?.startsWith('https://')
    );
    return https?.public_url || null;
  } catch (e) {
    return null;
  }
}

function parseEnv(content) {
  const map = new Map();
  content
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'))
    .forEach((line) => {
      const idx = line.indexOf('=');
      if (idx > -1) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        map.set(k, v);
      }
    });
  return map;
}

function serializeEnv(map, original) {
  const lines = [];
  const originalLines = original.split(/\r?\n/);
  const seen = new Set();
  for (const line of originalLines) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) {
      lines.push(line);
      continue;
    }
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    if (map.has(key)) {
      lines.push(`${key}=${map.get(key)}`);
      seen.add(key);
    } else {
      lines.push(line);
    }
  }
  for (const [k, v] of map.entries()) {
    if (!seen.has(k)) lines.push(`${k}=${v}`);
  }
  return lines.join(os.EOL) + os.EOL;
}

(async () => {
  const url = await getNgrokHttpsUrl();
  if (!url) {
    console.error(
      'Could not detect ngrok https tunnel at http://127.0.0.1:4040. Is ngrok running?'
    );
    process.exit(1);
  }

  const desired = new Map();
  desired.set('NEXTAUTH_URL', url);
  desired.set('NEXT_PUBLIC_APP_URL', url);

  let original = '';
  if (fs.existsSync(envPath)) {
    original = fs.readFileSync(envPath, 'utf8');
  }

  const merged = serializeEnv(desired, original);
  fs.writeFileSync(envPath, merged, 'utf8');
  console.log(
    `Updated .env.local with NEXTAUTH_URL and NEXT_PUBLIC_APP_URL = ${url}`
  );
})();
