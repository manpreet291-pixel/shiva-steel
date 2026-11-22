# SHIVA STEEL – Website + Admin Panel

React + Vite website with a small Node backend (no extra packages) so you can manage gallery photos yourself.

## Pages
- `/` Home (hero, about, products, why choose, gallery categories, contact)
- `/gallery` all gallery categories
- `/gallery/profile-gates`, `/gallery/ss-gates`, `/gallery/railings`, `/gallery/cnc-chokhat`, `/gallery/door-frames` … one page per category, each with an **Explore [product]** button that jumps to that product card (and every product card has a **View photo gallery** link back)
- `/admin` admin panel (password protected, hidden from search engines)

## Install and run (needs Node.js 18+)

```bash
npm install
cp .env.example .env        # then open .env and set ADMIN_PASSWORD to your own long password
npm run dev                 # website: http://localhost:5173   admin: http://localhost:5173/admin
```

## Managing the gallery (admin panel)
1. Open `/admin` and log in with the password from `.env`.
2. **Photos** tab: choose a category, pick one or many photos, press Upload. Photos are resized in the browser first. You can rename, move to another category or delete any photo.
3. **Categories** tab: add, rename, re-describe or delete categories. "Linked product" decides which product the **Explore** button opens. New categories get their own page automatically.
4. The grey "Sample image" photos are placeholders; delete them once you upload real ones.

Everything is saved in `server/data/` (`db.json` + `uploads/`). **Back up this folder.**

## Logo
`public/logo.png` and `public/favicon.png` are cut from your visiting card (Om + trishul). The card photo is small and slightly blurry, so for a sharper logo replace `public/logo.png` with a scan or the original design file (square PNG with transparent background).

## Deploying on Vercel (site + admin)
This project already works on Vercel: `vercel.json` makes deep links such as `/admin` and `/gallery/ss-gates` load (before, they gave 404 because Vercel only had the home page), and the `api/` folder runs the backend as a Vercel function. Photos and gallery data are stored in **Vercel Blob** (free tier is enough).

1. Upload/push this whole project (with the `api` folder, `vercel.json` and `package.json`). Vercel detects Vite automatically (build `npm run build`, output `dist`).
2. In the Vercel dashboard open your project, then **Storage**, then **Create** a **Blob** store. Choose **Public** access and connect it to the project (this adds `BLOB_READ_WRITE_TOKEN` automatically).
3. Project **Settings**, then **Environment Variables**: add `ADMIN_PASSWORD` (a long password of your own). Optional: `SESSION_SECRET` (any long random text).
4. **Redeploy** (Deployments, then the latest one, then Redeploy) so the new settings are picked up.
5. Open `https://your-site.vercel.app/admin` and log in.

**Quick check:** after deploying, open `https://your-site.vercel.app/api/health`. It must show `{"ok":true}`. If you see a web page, 404 or "405 Method Not Allowed", the `api` folder was not deployed. Upload the whole project again (the `api` folder, `vercel.json`, `server` and `src` folders must all be included; if you use GitHub, check they appear in the repository), then redeploy.

Notes for Vercel: photos are resized in the browser before upload because Vercel accepts requests up to about 4.5 MB; the 10-wrong-attempts lock is per server instance, so choose a strong password; data is stored in the Blob store, so nothing is lost on redeploys. Until the Blob store is connected the site shows the built-in sample gallery and the admin says storage is not connected.

## Production on your own server (Node)
```bash
npm install
npm run build
ADMIN_PASSWORD=your-password npm start     # serves the site, gallery API, admin and uploads on PORT (default 3001)
```
The admin panel needs this Node server, so use hosting that runs Node **with a persistent disk** (a small VPS, Render, Railway, Fly.io). Static-only hosts (Netlify drop, GitHub Pages) can show the site but not the admin panel; there the gallery falls back to the built-in sample list in `src/data/gallerySeed.js`.
- Set environment variables on the host: `ADMIN_PASSWORD`, `TRUST_PROXY=1` (behind a proxy/HTTPS), and optionally `DATA_DIR` pointing at the persistent disk.
- Use HTTPS (hosts like Render/Railway give it free). Keep the password long.
- Login is limited to 5 wrong attempts per 10 minutes.

## Banner image (top of the home page)
- Open `/admin`, go to the **Banners** tab and upload your banner image(s). Best size: wide, about 2000 × 1000 px (JPG or WebP). Keep the main subject on the **right**, because the heading sits on the left.
- One banner = a fixed image. Two or more (up to 8) = an automatic slideshow with arrows and dots.
- Until you upload one, the home page shows a default sample banner.

## Animations
- Other motion: hero text slides in, gold shimmering heading, product cards / tiles / photos pop in as you scroll, button shine, gold scroll-progress bar, page fade-in. Visitors who set "reduce motion" on their device get none of it.

## Other things to edit
- `src/data/site.js` phone, address, WhatsApp
- `src/data/products.js` the 10 product cards and their images (put photos in `public/images/`)
- `src/data/gallerySeed.js` starting categories (used the first time the server runs; after that use the admin panel)
- `public/images/hero.svg` hero background (replace with your photo and update `Hero.jsx`)
- `index.html` set `canonical` to your domain

## Contact form
No email backend. A valid form opens WhatsApp with the details prefilled, and the customer presses Send there.

## Latest updates
- **Admin → Products** tab: upload or remove the image of each home page product card (overrides the automatic gallery photo).
- Day/night toggle and clouds removed; reveal animations, sparks and the banner slideshow remain.
- Gallery viewer: click a photo to open; zoom with the +/- buttons, mouse wheel, double-click or pinch; drag to move when zoomed; arrow keys / swipe to change photos; Esc to close.
- Footer shows social icons instead of the logo. WhatsApp, Call and Map always show. Add Instagram / Facebook / YouTube links in **Admin → Settings**; each icon appears once its link is saved.
- Home page product cards automatically show the newest photo you upload to the linked gallery category (falls back to the sample image).
- Vercel: after redeploying, set `ADMIN_PASSWORD` and connect a Vercel Blob store so uploads and settings persist.
