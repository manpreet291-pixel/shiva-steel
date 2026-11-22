import { galleryCategories, galleryItems } from '../data/gallerySeed.js';

// ---- public gallery data (with a built-in fallback when no backend is running) ----
const fallback = {
  categories: galleryCategories.map((c, i) => {
    const mine = galleryItems.filter((x) => x.categoryId === c.id);
    return { ...c, order: i, count: mine.length, cover: mine[0]?.image || null };
  }),
  items: galleryItems,
  banners: [],
  productImages: {},
  settings: { social: {} },
  offline: true,
};

let cache = null;
let inflight = null;
const listeners = new Set();

export function loadGallery(force = false) {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight) return inflight;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  inflight = fetch('/api/gallery', { signal: ctrl.signal })
    .then((r) => {
      if (!r.ok) throw new Error('bad status');
      return r.json();
    })
    .then((d) => {
      if (!Array.isArray(d.categories) || !Array.isArray(d.items)) throw new Error('bad data');
      cache = { ...d, offline: false };
    })
    .catch(() => {
      cache = fallback;
    })
    .finally(() => {
      clearTimeout(timer);
      inflight = null;
      listeners.forEach((fn) => fn(cache));
    })
    .then(() => cache);
  return inflight;
}

export function subscribeGallery(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---- admin requests ----
export async function adminRequest(method, url, body) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'shiva-admin' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = {};
  const isJson = (res.headers.get('content-type') || '').includes('json');
  if (isJson) {
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
  }
  // An HTML answer (or 404/405) means the API is not deployed on this site.
  if (!isJson || res.status === 404 || res.status === 405) {
    if (!isJson || !data.error) {
      const err = new Error(
        'The admin backend was not found on this website. On Vercel, make sure the "api" folder and vercel.json were deployed, then redeploy (see README).'
      );
      err.status = 404;
      err.backendMissing = true;
      throw err;
    }
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Shrinks a photo in the browser before upload (max 1600px, JPEG) so pages stay fast.
export function compressImage(file, maxSize = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} is not a readable image`));
    };
    img.src = url;
  });
}
