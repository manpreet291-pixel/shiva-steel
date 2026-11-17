// Shared backend logic (API + login). Used by the local Node server (server/index.js)
// and by the Vercel serverless function (api/[...path].js). Storage is pluggable:
//   store.load() -> db     store.save(db)
//   store.saveImage(buffer, ext) -> url     store.removeImage(url)
import crypto from 'node:crypto';
import { galleryCategories, galleryItems } from '../src/data/gallerySeed.js';
import { products } from '../src/data/products.js';

const SESSION_MS = 8 * 60 * 60 * 1000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel functions accept at most ~4.5 MB per request
const MAX_BODY_BYTES = 6 * 1024 * 1024;
const PRODUCT_IDS = new Set(products.map((p) => p.id));

export function seedDb() {
  const now = new Date().toISOString();
  return {
    categories: galleryCategories.map((c, i) => ({ ...c, order: i })),
    items: galleryItems.map((i) => ({ ...i, createdAt: now })),
  };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const newId = () => crypto.randomBytes(6).toString('hex');
const slugify = (s) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'category';
const cleanText = (v, max) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const sha = (s) => crypto.createHash('sha256').update(s).digest();

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers,
  });
  res.end(body);
}
export const sendJson = (res, status, obj, headers = {}) =>
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });

function readJson(req) {
  // Vercel has already parsed the body for us
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) {
      try { return Promise.resolve(JSON.parse(req.body.toString('utf8'))); } catch { return Promise.reject(new HttpError(400, 'Invalid JSON')); }
    }
    if (typeof req.body === 'string') {
      try { return Promise.resolve(JSON.parse(req.body || '{}')); } catch { return Promise.reject(new HttpError(400, 'Invalid JSON')); }
    }
    return Promise.resolve(req.body);
  }
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

export function createApi({ store, adminPassword = '', secret, trustProxy = false }) {
  if (!secret) throw new Error('secret is required');
  const attempts = new Map(); // ip -> { count, until }

  // ---- auth ----
  const sign = (p) => crypto.createHmac('sha256', secret).update(p).digest('base64url');
  const makeToken = () => {
    const p = `${Date.now() + SESSION_MS}.${crypto.randomBytes(8).toString('hex')}`;
    return `${p}.${sign(p)}`;
  };
  const validToken = (t) => {
    if (!t) return false;
    const parts = t.split('.');
    if (parts.length !== 3) return false;
    const a = Buffer.from(parts[2]);
    const b = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    return Number(parts[0]) > Date.now();
  };
  const getCookie = (req, name) => {
    for (const part of (req.headers.cookie || '').split(';')) {
      const i = part.indexOf('=');
      if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
    }
    return '';
  };
  const isAdmin = (req) => validToken(getCookie(req, 'ss_admin'));
  const isHttps = (req) => !!req.socket?.encrypted || (trustProxy && req.headers['x-forwarded-proto'] === 'https');
  const cookie = (req, value, maxAgeSec) =>
    `ss_admin=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSec}${isHttps(req) ? '; Secure' : ''}`;
  const requireAdmin = (req) => {
    if (!isAdmin(req)) throw new HttpError(401, 'Please log in');
    if (req.headers['x-requested-with'] !== 'shiva-admin') throw new HttpError(403, 'Bad request');
  };
  const clientIp = (req) =>
    trustProxy && req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';

  // ---- images ----
  async function saveImage(dataUrl) {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
    if (!m) throw new HttpError(400, 'Image must be a JPG, PNG or WebP');
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) throw new HttpError(400, 'Image must be under 4 MB');
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const okMagic =
      (ext === 'jpg' && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) ||
      (ext === 'png' && buf.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) ||
      (ext === 'webp' && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP');
    if (!okMagic) throw new HttpError(400, 'File is not a valid image');
    return store.saveImage(buf, ext);
  }

  function publicGallery(db) {
    const categories = [...db.categories]
      .sort((a, b) => a.order - b.order)
      .map((c) => {
        const mine = db.items.filter((i) => i.categoryId === c.id);
        return { ...c, count: mine.length, cover: mine[0]?.image || null };
      });
    return { categories, items: db.items };
  }

  async function route(req, res, pathname) {
    const method = req.method;

    if (pathname === '/api/health') return sendJson(res, 200, { ok: true });
    if (pathname === '/api/gallery' && method === 'GET') return sendJson(res, 200, publicGallery(await store.load()));
    if (pathname === '/api/me' && method === 'GET') return sendJson(res, 200, { admin: isAdmin(req), configured: !!adminPassword });

    if (pathname === '/api/login' && method === 'POST') {
      if (!adminPassword) throw new HttpError(503, 'Admin password is not set. Add ADMIN_PASSWORD (in .env locally, or in Vercel Environment Variables) and restart/redeploy.');
      if (req.headers['x-requested-with'] !== 'shiva-admin') throw new HttpError(403, 'Bad request');
      const ip = clientIp(req);
      const rec = attempts.get(ip) || { count: 0, until: 0 };
      if (rec.until > Date.now()) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
      const body = await readJson(req);
      const ok = crypto.timingSafeEqual(sha(String(body.password ?? '')), sha(adminPassword));
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

    if (pathname.startsWith('/api/categories') || pathname.startsWith('/api/items')) {
      requireAdmin(req);
      const parts = pathname.split('/').filter(Boolean);
      const id = parts[2];
      const db = await store.load();

      if (parts[1] === 'categories') {
        if (!id && method === 'POST') {
          const b = await readJson(req);
          const name = cleanText(b.name, 60);
          if (name.length < 2) throw new HttpError(400, 'Category name is required');
          let slug = slugify(name);
          const base = slug;
          for (let n = 2; db.categories.some((c) => c.slug === slug); n += 1) slug = `${base}-${n}`;
          const cat = {
            id: newId(), slug, name,
            productId: b.productId && PRODUCT_IDS.has(b.productId) ? b.productId : '',
            description: cleanText(b.description, 300),
            order: db.categories.reduce((m, c) => Math.max(m, c.order), -1) + 1,
          };
          db.categories.push(cat);
          await store.save(db);
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
          await store.save(db);
          return sendJson(res, 200, cat);
        }
        if (method === 'DELETE') {
          const gone = db.items.filter((i) => i.categoryId === cat.id);
          db.items = db.items.filter((i) => i.categoryId !== cat.id);
          db.categories = db.categories.filter((c) => c.id !== cat.id);
          await store.save(db);
          for (const i of gone) await store.removeImage(i.image);
          return sendJson(res, 200, { ok: true });
        }
      }

      if (parts[1] === 'items') {
        if (!id && method === 'POST') {
          const b = await readJson(req);
          const cat = db.categories.find((c) => c.id === b.categoryId);
          if (!cat) throw new HttpError(400, 'Choose a category');
          const image = await saveImage(b.image);
          const item = { id: newId(), categoryId: cat.id, image, title: cleanText(b.title, 80) || cat.name, createdAt: new Date().toISOString() };
          db.items.unshift(item);
          await store.save(db);
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
          await store.save(db);
          return sendJson(res, 200, item);
        }
        if (method === 'DELETE') {
          db.items = db.items.filter((i) => i.id !== item.id);
          await store.save(db);
          await store.removeImage(item.image);
          return sendJson(res, 200, { ok: true });
        }
      }
      throw new HttpError(405, 'Method not allowed');
    }

    throw new HttpError(404, 'Not found');
  }

  // Handles one /api/* request; never throws.
  return async function handleApi(req, res, pathname) {
    try {
      await route(req, res, pathname);
    } catch (err) {
      if (res.headersSent) return res.end();
      if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message });
      console.error(err);
      return sendJson(res, 500, { error: 'Server error' });
    }
  };
}
