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

## Production (the real website)
```bash
npm install
npm run build
ADMIN_PASSWORD=your-password npm start     # serves the site, gallery API, admin and uploads on PORT (default 3001)
```
The admin panel needs this Node server, so use hosting that runs Node **with a persistent disk** (a small VPS, Render, Railway, Fly.io). Static-only hosts (Netlify drop, GitHub Pages) can show the site but not the admin panel; there the gallery falls back to the built-in sample list in `src/data/gallerySeed.js`.
- Set environment variables on the host: `ADMIN_PASSWORD`, `TRUST_PROXY=1` (behind a proxy/HTTPS), and optionally `DATA_DIR` pointing at the persistent disk.
- Use HTTPS (hosts like Render/Railway give it free). Keep the password long.
- Login is limited to 5 wrong attempts per 10 minutes.

## Other things to edit
- `src/data/site.js` phone, address, WhatsApp
- `src/data/products.js` the 10 product cards and their images (put photos in `public/images/`)
- `src/data/gallerySeed.js` starting categories (used the first time the server runs; after that use the admin panel)
- `public/images/hero.svg` hero background (replace with your photo and update `Hero.jsx`)
- `index.html` set `canonical` to your domain

## Contact form
No email backend. A valid form opens WhatsApp with the details prefilled, and the customer presses Send there.
