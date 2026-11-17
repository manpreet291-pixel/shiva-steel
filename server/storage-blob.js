// Vercel storage: the gallery database (JSON) and photos live in a Vercel Blob store (public).
// Needs the BLOB_READ_WRITE_TOKEN environment variable, which Vercel adds automatically when you
// connect a Blob store to the project.
import crypto from 'node:crypto';

const DB_KEY = 'shiva-steel/db.json';
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// `sdk` and `fetchFn` can be injected for tests.
export function createBlobStore({ seed, sdk, fetchFn = fetch }) {
  let sdkPromise = sdk ? Promise.resolve(sdk) : null;
  const getSdk = () => (sdkPromise ||= import('@vercel/blob'));

  async function save(db) {
    const { put } = await getSdk();
    await put(DB_KEY, JSON.stringify(db), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  }

  return {
    async load() {
      const { list } = await getSdk();
      const { blobs } = await list({ prefix: DB_KEY, limit: 1 });
      if (!blobs.length) {
        const db = seed();
        await save(db);
        return db;
      }
      const r = await fetchFn(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`Could not read gallery data (${r.status})`);
      return r.json();
    },
    save,
    async saveImage(buf, ext) {
      const { put } = await getSdk();
      const name = `shiva-steel/uploads/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const blob = await put(name, buf, { access: 'public', contentType: MIME[ext], addRandomSuffix: false });
      return blob.url;
    },
    async removeImage(url) {
      if (typeof url !== 'string' || !/^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(url)) return;
      const { del } = await getSdk();
      try {
        await del(url);
      } catch (err) {
        console.error('Could not delete blob', err);
      }
    },
  };
}
