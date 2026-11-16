// SHIVA STEEL backend: zero dependencies (Node 18+).
//  - Public JSON API for the gallery
//  - Password-protected admin API (categories + photo uploads)
//  - Serves the built website (dist/) and uploaded photos
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { galleryCategories, galleryItems } from '../src/data/gallerySeed.js';
import { products } from '../src/data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------- config ----------
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
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DIST_DIR = path.join(ROOT, 'dist');
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const SESSION_MS = 8 * 60 * 60 * 1000;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_BODY_BYTES = 10 * 1024 * 1024;
const PRODUCT_IDS = new Set(products.map((p) => p.id));

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function getSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const f = path.join(DATA_DIR, '.secret');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  const s = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(f, s, { mode: 0o600 });
  return s;
}
const SECRET = getSecret();

// ---------- database (one JSON file) ----------
let db;
function saveDb() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}
function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return;
  }
  const now = new Date().toISOString();
  db = {
    categories: galleryCategories.map((c, i) => ({ ...c, order: i })),
    items: galleryItems.map((i) => ({ ...i, createdAt: now })),
  };
  saveDb();
}
loadDb();

const newId = () => crypto.randomBytes(6).toString('hex');
const slugify = (s) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'category';

function publicGallery() {
  const categories = [...db.categories]
    .sort((a, b) => a.order - b.order)
    .map((c) => {
      const mine = db.items.filter((i) => i.categoryId === c.id);
      return { ...c, count: mine.length, cover: mine[0]?.image || null };
    });
  return { categories, items: db.items };
}

// ---------- helpers ----------
function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers,
  });
  res.end(body);
}
const sendJson = (res, status, obj, headers = {}) =>
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Request too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new HttpError(400, 'Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// ---------- auth ----------
const sign = (p) => crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
function makeToken() {
  const p = `${Date.now() + SESSION_MS}.${crypto.randomBytes(8).toString('hex')}`;
  return `${p}.${sign(p)}`;
}
function validToken(t) {
  if (!t) return false;
  const parts = t.split('.');
  if (parts.length !== 3) return false;
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(parts[0]) > Date.now();
}
function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}
const isAdmin = (req) => validToken(getCookie(req, 'ss_admin'));
const isHttps = (req) => req.socket.encrypted || (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https');
function cookie(req, value, maxAgeSec) {
  return `ss_admin=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSec}${isHttps(req) ? '; Secure' : ''}`;
}
function requireAdmin(req) {
  if (!isAdmin(req)) throw new HttpError(401, 'Please log in');
  if (req.headers['x-requested-with'] !== 'shiva-admin') throw new HttpError(403, 'Bad request');
}
const sha = (s) => crypto.createHash('sha256').update(s).digest();

const attempts = new Map(); // ip -> { count, until }
function clientIp(req) {
  if (TRUST_PROXY && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

// ---------- images ----------
function saveImage(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw new HttpError(400, 'Image must be a JPG, PNG or WebP');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) throw new HttpError(400, 'Image must be under 6 MB');
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const okMagic =
    (ext === 'jpg' && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) ||
    (ext === 'png' && buf.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) ||
    (ext === 'webp' && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP');
  if (!okMagic) throw new HttpError(400, 'File is not a valid image');
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}
function removeUpload(image) {
  if (typeof image !== 'string' || !image.startsWith('/uploads/')) return;
  const name = path.basename(image);
  if (!/^[a-z0-9._-]+$/i.test(name)) return;
  fs.rmSync(path.join(UPLOAD_DIR, name), { force: true });
}

const cleanText = (v, max) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

// ---------- API ----------
async function handleApi(req, res, pathname) {
  const method = req.method;

  if (pathname === '/api/health') return sendJson(res, 200, { ok: true });
  if (pathname === '/api/gallery' && method === 'GET') return sendJson(res, 200, publicGallery());
  if (pathname === '/api/me' && method === 'GET') return sendJson(res, 200, { admin: isAdmin(req), configured: !!ADMIN_PASSWORD });

  if (pathname === '/api/login' && method === 'POST') {
    if (!ADMIN_PASSWORD) throw new HttpError(503, 'Admin password is not set. Add ADMIN_PASSWORD to the .env file and restart the server.');
    if (req.headers['x-requested-with'] !== 'shiva-admin') throw new HttpError(403, 'Bad request');
    const ip = clientIp(req);
    const rec = attempts.get(ip) || { count: 0, until: 0 };
    if (rec.until > Date.now()) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
    const body = await readJson(req);
    const ok = crypto.timingSafeEqual(sha(String(body.password ?? '')), sha(ADMIN_PASSWORD));
    if (!ok) {
      rec.count += 1;
      if (rec.count >= 5) {
        rec.count = 0;
        rec.until = Date.now() + 10 * 60 * 1000;
      }
      attempts.set(ip, rec);
      throw new HttpError(401, 'Incorrect password');
    }
    attempts.delete(ip);
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, makeToken(), SESSION_MS / 1000) });
  }
  if (pathname === '/api/logout' && method === 'POST') {
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, '', 0) });
  }

  // ---- everything below needs admin ----
  if (pathname.startsWith('/api/categories') || pathname.startsWith('/api/items')) {
    requireAdmin(req);
    const parts = pathname.split('/').filter(Boolean); // ['api','categories',':id']
    const id = parts[2];

    if (parts[1] === 'categories') {
      if (!id && method === 'POST') {
        const b = await readJson(req);
        const name = cleanText(b.name, 60);
        if (name.length < 2) throw new HttpError(400, 'Category name is required');
        const productId = b.productId && PRODUCT_IDS.has(b.productId) ? b.productId : '';
        let slug = slugify(name);
        const base = slug;
        for (let n = 2; db.categories.some((c) => c.slug === slug); n += 1) slug = `${base}-${n}`;
        const cat = {
          id: newId(), slug, name, productId,
          description: cleanText(b.description, 300),
          order: db.categories.reduce((m, c) => Math.max(m, c.order), -1) + 1,
        };
        db.categories.push(cat);
        saveDb();
        return sendJson(res, 201, cat);
      }
      const cat = db.categories.find((c) => c.id === id);
      if (!cat) throw new HttpError(404, 'Category not found');
      if (method === 'PUT') {
        const b = await readJson(req);
        const name = cleanText(b.name, 60);
        if (name.length < 2) throw new HttpError(400, 'Category name is required');
        cat.name = name;
        cat.description = cleanText(b.description, 300);
        cat.productId = b.productId && PRODUCT_IDS.has(b.productId) ? b.productId : '';
        saveDb();
        return sendJson(res, 200, cat);
      }
      if (method === 'DELETE') {
        db.items.filter((i) => i.categoryId === cat.id).forEach((i) => removeUpload(i.image));
        db.items = db.items.filter((i) => i.categoryId !== cat.id);
        db.categories = db.categories.filter((c) => c.id !== cat.id);
        saveDb();
        return sendJson(res, 200, { ok: true });
      }
    }

    if (parts[1] === 'items') {
      if (!id && method === 'POST') {
        const b = await readJson(req);
        const cat = db.categories.find((c) => c.id === b.categoryId);
        if (!cat) throw new HttpError(400, 'Choose a category');
        const image = saveImage(b.image);
        const item = {
          id: newId(), categoryId: cat.id, image,
          title: cleanText(b.title, 80) || cat.name,
          createdAt: new Date().toISOString(),
        };
        db.items.unshift(item);
        saveDb();
        return sendJson(res, 201, item);
      }
      const item = db.items.find((i) => i.id === id);
      if (!item) throw new HttpError(404, 'Photo not found');
      if (method === 'PUT') {
        const b = await readJson(req);
        if (b.categoryId !== undefined) {
          if (!db.categories.some((c) => c.id === b.categoryId)) throw new HttpError(400, 'Unknown category');
          item.categoryId = b.categoryId;
        }
        if (b.title !== undefined) item.title = cleanText(b.title, 80) || item.title;
        saveDb();
        return sendJson(res, 200, item);
      }
      if (method === 'DELETE') {
        removeUpload(item.image);
        db.items = db.items.filter((i) => i.id !== item.id);
        saveDb();
        return sendJson(res, 200, { ok: true });
      }
    }
    throw new HttpError(405, 'Method not allowed');
  }

  throw new HttpError(404, 'Not found');
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
    if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed');
    return handleStatic(req, res, pathname);
  } catch (err) {
    if (res.headersSent) return res.end();
    if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message });
    console.error(err);
    return sendJson(res, 500, { error: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`SHIVA STEEL server on http://localhost:${PORT}`);
  console.log(`Data folder: ${DATA_DIR}`);
  if (!ADMIN_PASSWORD) console.warn('WARNING: ADMIN_PASSWORD is not set, so admin login is disabled. See .env.example.');
});
