/**
 * Keeps vercel.json document CSP in sync with api/_lib/cspPolicy.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTION_CONTENT_SECURITY_POLICY } from '../api/_lib/cspPolicy.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vercelPath = join(root, 'vercel.json');
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));
const docHeaders = vercel.headers.find((h) => h.source === '/(.*)');
const cspHeader = docHeaders?.headers.find((h) => h.key === 'Content-Security-Policy');

if (!cspHeader) {
  console.error('sync-vercel-csp: CSP header not found in vercel.json');
  process.exit(1);
}

cspHeader.value = PRODUCTION_CONTENT_SECURITY_POLICY;
writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
console.log('sync-vercel-csp: updated vercel.json Content-Security-Policy');
