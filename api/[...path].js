// Vercel serverless function: handles every /api/* request (gallery, login, admin changes).
import crypto from 'node:crypto';
import { createApi, seedDb, sendJson } from '../server/core.js';
import { createBlobStore } from '../server/storage-blob.js';

let handler;

function getHandler() {
  if (handler) return handler;
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  // Sessions are signed with this secret. If SESSION_SECRET is not set, derive one from the admin password.
  const secret =
    process.env.SESSION_SECRET ||
    crypto.createHash('sha256').update(`shiva-steel-session:${adminPassword || 'unset'}`).digest('hex');
  handler = createApi({ store: createBlobStore({ seed: seedDb }), adminPassword, secret, trustProxy: true });
  return handler;
}

const NO_STORE_NEEDED = new Set(['/api/me', '/api/login', '/api/logout', '/api/health']);

export default async function vercelHandler(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');
  const blobReady = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN);
  if (!blobReady && !NO_STORE_NEEDED.has(pathname)) {
    // Without a Blob store the website still shows its built-in sample gallery.
    return sendJson(res, 503, {
      error: 'Storage is not connected. In Vercel: Storage -> Create a public Blob store -> connect it to this project, then redeploy.',
    });
  }
  return getHandler()(req, res, pathname);
}
