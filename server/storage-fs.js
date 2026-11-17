// Local storage: db.json + photos in a folder on disk (used by `npm run dev` / `npm start`).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function createFsStore({ dataDir, seed }) {
  const uploadDir = path.join(dataDir, 'uploads');
  const dbFile = path.join(dataDir, 'db.json');
  fs.mkdirSync(uploadDir, { recursive: true });

  let db;
  if (fs.existsSync(dbFile)) db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  else {
    db = seed();
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  }

  return {
    uploadDir,
    async load() {
      return db;
    },
    async save(next) {
      db = next;
      const tmp = `${dbFile}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
      fs.renameSync(tmp, dbFile);
    },
    async saveImage(buf, ext) {
      const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, name), buf);
      return `/uploads/${name}`;
    },
    async removeImage(url) {
      if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;
      const name = path.basename(url);
      if (/^[a-z0-9._-]+$/i.test(name)) fs.rmSync(path.join(uploadDir, name), { force: true });
    },
  };
}
