#!/usr/bin/env node
// Ensure NODE_ENV is unset so Next.js can set the correct standard value.
if (process.env.NODE_ENV) {
  delete process.env.NODE_ENV;
}
// Forward to Next.js build
const { spawn } = require('node:child_process');
const child = spawn('next', ['build'], { stdio: 'inherit', env: process.env });
child.on('exit', (code) => process.exit(code));
