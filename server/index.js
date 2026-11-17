// SHIVA STEEL local/standalone server: zero dependencies (Node 18+).
//  - Public JSON API for the gallery + password-protected admin API (see server/core.js)
//  - Serves the built website (dist/) and uploaded photos
// On Vercel the same API runs as a serverless function instead (api/[...path].js).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createApi, seedDb, sendJson } from './core.js';
import { createFsStore } from './storage-fs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv(path.join(ROOT, '.env'));

const PORT = Number(process.env.PORT) || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'server', 'data'));
const DIST_DIR = path.join(ROOT, 'dist');

fs.mkdirSync(DATA_DIR, { recursive: true });
function getSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const f = path.join(DATA_DIR, '.secret');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  const s = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(f, s, { mode: 0o600 });
  return s;
}

const store = createFsStore({ dataDir: DATA_DIR, seed: seedDb });
const UPLOAD_DIR = store.uploadDir;
const handleApi = createApi({ store, adminPassword: ADMIN_PASSWORD, secret: getSecret(), trustProxy: process.env.TRUST_PROXY === '1' });

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers,
  });
  res.end(body);
}

// ---------- static files ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};
function serveFile(req, res, file, cache) {
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  if (req.method === 'HEAD') res.end();
  else fs.createReadStream(file).pipe(res);
  return true;
}
function safeJoin(base, rel) {
  const full = path.normalize(path.join(base, rel));
  return full === base || full.startsWith(base + path.sep) ? full : null;
}

function handleStatic(req, res, pathname) {
  if (pathname.startsWith('/uploads/')) {
    const name = pathname.slice('/uploads/'.length);
    if (/^[a-z0-9._-]+$/i.test(name) && serveFile(req, res, path.join(UPLOAD_DIR, name), 'public, max-age=604800')) return;
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  }
  if (!fs.existsSync(DIST_DIR)) {
    return send(res, 200, 'SHIVA STEEL server is running. Build the website with "npm run build", or use "npm run dev" while developing.', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return send(res, 400, 'Bad request', { 'Content-Type': 'text/plain' });
  }
  const full = safeJoin(DIST_DIR, rel);
  if (!full) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });
  const hashed = pathname.startsWith('/assets/');
  if (serveFile(req, res, full, hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=3600')) return;
  if (path.extname(pathname)) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  // Single-page app: any other path gets the app shell
  if (!serveFile(req, res, path.join(DIST_DIR, 'index.html'), 'no-cache')) send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
}

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed' });
    return handleStatic(req, res, pathname);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJson(res, 500, { error: 'Server error' });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`SHIVA STEEL server on http://localhost:${PORT}`);
  console.log(`Data folder: ${DATA_DIR}`);
  if (!ADMIN_PASSWORD) console.warn('WARNING: ADMIN_PASSWORD is not set, so admin login is disabled. See .env.example.');
});
