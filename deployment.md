# Beacon Trust — Deployment Guide

## Architecture

```
yourdomain.com                      ← static files hosted on cPanel (public_html)
  └── index.html, assets/, .htaccess

https://beacon-trust-api.onrender.com  ← Express API hosted on Render
  └── /api/auth, /api/accounts, /api/cards, /api/transactions ...

ep-xxx.neon.tech                    ← PostgreSQL database hosted on Neon
  └── users, accounts, transactions, cards, beneficiaries ...
```

---

## Step 1 — Database (PostgreSQL on Neon)

cPanel only supports MySQL. Use [Neon](https://neon.tech) for PostgreSQL (free tier available).

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the **Connection string** from the dashboard (starts with `postgresql://...`)
4. Push the schema to create all tables — run this once from the project root:

```bash
DATABASE_URL="postgresql://your-connection-string" npm run -w @workspace/db push
```

---

## Step 2 — Backend on Render

1. Push this repository to GitHub (if not already done)
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Configure the service:

| Setting | Value |
|---|---|
| **Root Directory** | *(leave blank)* |
| **Build Command** | `npm install && npm run build -w @workspace/api-server` |
| **Start Command** | `node --enable-source-maps artifacts/api-server/dist/index.mjs` |
| **Node Version** | 22 |

5. Add the following **Environment Variables** in Render's dashboard:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `JWT_SECRET` | A random string, 40+ characters |
| `SESSION_SECRET` | A random string, 40+ characters |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGIN` | `https://yourdomain.com` (your frontend domain) |

6. Click **Deploy**. Render will give you a URL like `https://beacon-trust-api.onrender.com`.

> **Note:** Render's free tier spins down after 15 minutes of inactivity. Upgrade to a paid plan ($7/mo) to keep the API always-on — important for a banking app.

---

## Step 3 — Frontend on cPanel

### Build for production

Run this from the project root, replacing the URL with your actual Render service URL:

```bash
VITE_API_URL=https://beacon-trust-api.onrender.com npm run build
```

Output lands in `artifacts/beacon-trust/dist/`.

### Upload to cPanel

1. Log into your cPanel → **File Manager**
2. Navigate to `public_html` (or a subdirectory if hosting on a subdomain, e.g. `public_html/app`)
3. Upload **all files** from `artifacts/beacon-trust/dist/`:
   - `index.html`
   - `favicon.svg`
   - `logo.png`
   - `robots.txt`
   - `.htaccess` ← **do not skip this**
   - the entire `assets/` folder

The `.htaccess` file is critical — it ensures that direct URL navigation (e.g. `yourdomain.com/login`, `yourdomain.com/dashboard`) works correctly instead of showing a 404.

### .htaccess contents (already included in the dist folder)

```apacheconf
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Rebuilding after code changes

Whenever you update the code:

1. **Backend change** → push to GitHub; Render auto-deploys on push (enable auto-deploy in Render settings).
2. **Frontend change** → rebuild and re-upload the `dist/` folder:
   ```bash
   VITE_API_URL=https://beacon-trust-api.onrender.com npm run build
   ```
   Then upload the updated `dist/` to cPanel again.

---

## Environment variable reference

### Render (API server)

| Key | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string from Neon |
| `JWT_SECRET` | Secret used to sign user login tokens |
| `SESSION_SECRET` | Secret used for session management |
| `NODE_ENV` | Set to `production` |
| `ALLOWED_ORIGIN` | Comma-separated list of allowed frontend origins |

### Build-time (frontend)

| Key | Description |
|---|---|
| `VITE_API_URL` | Full URL of your Render API service (no trailing slash) |
