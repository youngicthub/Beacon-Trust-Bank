# Beacon Trust

A full-stack digital private banking app with a public marketing site, customer dashboard (accounts, transfers, cards, loans, investments, KYC), and an admin panel — all backed by Supabase auth and a PostgreSQL database.

---

## Running on Replit

### Required secrets

Set these in the Replit Secrets panel (the lock icon in the sidebar):

| Secret | Notes |
|---|---|
| `JWT_SECRET` | Any long random string — used to sign API session tokens |

The following are already set in `.env` and do not need to be added as secrets:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase project credentials
- `SESSION_SECRET` — Express session secret
- `DATABASE_URL` — auto-injected by Replit; do not set this manually

### One-time setup

```bash
npm install                      # install all workspace dependencies
npm run push -w @workspace/db    # push Drizzle schema to the Replit PostgreSQL database
```

### Run

Start both servers together with the **Project** workflow (the Run button), or individually:

```bash
npm run dev          # Beacon Trust frontend — Vite on $PORT (default 5173)
npm run dev:api      # API server — Express on $PORT (default 3001)
```

---

## Local development (outside Replit)

### One-time setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd <repo>
npm install

# 2. Configure environment — copy the example and fill in your values
cp .env.example .env
```

Edit `.env` and set:
| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase project → Settings → API (anon/public key) |
| `SESSION_SECRET` | Any long random string |
| `DATABASE_URL` | Your PostgreSQL connection string |

### Run

```bash
# Frontend only (React/Vite — http://localhost:5173)
npm run dev

# API server only (Express — http://localhost:8080)
npm run dev:api

# Both at once (two separate terminals, or use a process manager)
npm run dev          # terminal 1
npm run dev:api      # terminal 2
```

### Build for static hosting (upload to public_html)

```bash
npm run build
```

Output is in **`artifacts/beacon-trust/dist/`** — upload the entire contents of that folder to your `public_html` directory.

> ⚠️ The Express API server cannot be deployed to traditional shared/static hosting. If your host supports Node.js, see the API server section below.

---

## Package manager: npm

This project uses **npm workspaces**. Do not use `yarn` or `pnpm`.

- Workspace packages live in `artifacts/*`, `lib/*`, and `scripts/`
- Root `package.json` holds the `"workspaces"` array and `"overrides"` (esbuild pinning)
- `vite` and `@vitejs/plugin-react` are listed in root devDependencies — required because npm hoists `@vitejs/plugin-react` to root and it needs to find `vite` there

### Adding packages

```bash
# Add to a specific workspace
npm install <package> -w @workspace/beacon-trust
npm install <package> -w @workspace/api-server

# Add a dev dependency at the root
npm install -D <package>
```

---

## Environment variables

| Variable | Required by | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Supabase anon/publishable key |
| `DATABASE_URL` | API server | Auto-set by Replit; set manually for local dev |
| `SESSION_SECRET` | API server | Set as a Replit secret or in `.env` |

---

## Stack

- **Package manager**: npm workspaces
- **Runtime**: Node.js 20, TypeScript 5.9
- **Frontend**: React 19 + Vite 7, Tailwind CSS 4, shadcn/ui, TanStack Query, Wouter
- **Icons**: Font Awesome Free (`@fortawesome/react-fontawesome`) — all icons exported from `src/lib/icons.tsx`
- **Auth**: Supabase (`@supabase/supabase-js`)
- **API**: Express 5, built with esbuild (CJS bundle)
- **DB**: PostgreSQL + Drizzle ORM + Zod validation
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/`)

---

## Where things live

| Path | What it is |
|---|---|
| `artifacts/beacon-trust/` | React/Vite frontend |
| `artifacts/beacon-trust/dist/` | Production build output (upload to public_html) |
| `artifacts/api-server/` | Express 5 API server |
| `lib/db/` | Drizzle schema + DB client |
| `lib/api-spec/` | OpenAPI spec (source of truth for codegen) |
| `lib/api-zod/` | Generated Zod schemas (from codegen) |
| `lib/api-client-react/` | Generated React Query hooks (from codegen) |
| `src/lib/icons.tsx` | All Font Awesome icon exports (add new icons here) |

---

## Database

```bash
# Push schema changes to the dev database (run after editing lib/db/src/schema/)
npm run -w @workspace/db push

# Regenerate API hooks and Zod schemas from the OpenAPI spec
npm run -w @workspace/api-spec codegen
```

---

## Auth flow

- Registration and login are handled by Supabase Auth
- On sign-up, the app attempts an immediate sign-in — if Supabase email confirmation is disabled, the user goes straight to the dashboard
- If email confirmation is enforced, a confirmation email is sent; the link redirects to `/auth/callback` on this app
- Email redirect URLs always use `window.location.origin`, so they work correctly on any deployment

---

## Architecture decisions

- Supabase handles auth; the PostgreSQL database handles application data
- Icons are centralised in `artifacts/beacon-trust/src/lib/icons.tsx` — all 58 source files import from there instead of directly from any icon library
- esbuild is pinned to `0.27.3` via `overrides` in root `package.json`
- Vite `PORT` and `BASE_PATH` default to `5173` and `/` respectively when not set by the environment

---

## Gotchas

- `npm install` must be run from the repo root, not from inside a workspace package
- `DATABASE_URL` is auto-injected by Replit — do not set it manually there
- The production build output is `artifacts/beacon-trust/dist/` — not the repo root

---

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
