// Runs the backend (port 3001) and the Vite dev server (port 5173) together.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (args) => spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });

const server = run(['server/index.js']);
const vite = run(['node_modules/vite/bin/vite.js']);

const stop = () => { server.kill(); vite.kill(); };
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });
server.on('exit', (c) => { if (c) { vite.kill(); process.exit(c); } });
vite.on('exit', (c) => { server.kill(); process.exit(c ?? 0); });
