# AERIS Mountain Retreat

Portfolio full-stack booking app: React, TypeScript, Vite, GSAP/Lenis, Node.js, Express, Prisma and PostgreSQL. Original responsive UI, animations and assets are preserved.

**DEMO ONLY.** Use fictional guest details. No payments, emails or real reservations. Firebase production is untouched.

## Local setup

Requires Node.js 22.14+ and Docker Compose (or PostgreSQL 16+).

1. Copy `.env.example` to `.env` (`Copy-Item .env.example .env` in PowerShell).
2. Set your own `POSTGRES_PASSWORD`, matching URL-encoded password in `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (12+ characters). Keep `VITE_DEMO_MODE=false`.
3. Run:

```sh
npm ci
docker compose up -d --wait
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:api
```

In a second terminal:

```sh
npm run dev
```

Open http://127.0.0.1:5173 and http://127.0.0.1:5173/admin. Sign in with your local environment credentials. The API listens on 127.0.0.1:3001; Vite proxies /api. Keep `APP_ORIGIN` equal to the frontend origin. If changing API port, set both `PORT` and `API_PORT`. An existing PostgreSQL server may replace Docker. If port 5432 is occupied, change the Compose host port and database URL.

Seed creates missing rooms without overwriting existing prices and resets the configured admin password. Docker data survives restarts. Stop with `docker compose down`.

## Static demo / Firebase compatibility

```sh
npm run dev:demo
npm run build:demo
```

These explicitly load `.env.demo` (`VITE_DEMO_MODE=true`), preserving the original browser-only booking/contact demo without an API. Firebase hosting configuration is unchanged. No deployment command is run. Full-stack mode never silently falls back to simulated success.

## Verification

```sh
npm run typecheck
npm test
npm run build
npm run test:browser
```

Build outputs `dist/` and `dist-server/` are ignored. Run compiled API with `npm run start:api` and preview frontend with `npm run preview -- --port 5173`; preview also proxies /api. Browser tests start an isolated static-demo server on port 5174. Install Chromium once: `npx playwright install chromium`. To reuse local browsers, set `PLAYWRIGHT_BROWSERS_PATH` to the absolute `.local-browsers` path.

Integration/full-stack tests require a **dedicated local database ending in _test**. Create it once:

```sh
docker compose exec postgres createdb -U aeris aeris_test
```

Set `TEST_DATABASE_URL` in .env, then migrate it (PowerShell):

```powershell
$env:DATABASE_URL = 'postgresql://aeris:YOUR_URL_ENCODED_PASSWORD@localhost:5432/aeris_test?schema=public'
npm run db:migrate
Remove-Item Env:DATABASE_URL
npm run test:integration
npm run test:fullstack
```

Tests use real PostgreSQL, unique fixtures and targeted cleanup. Full-stack tests start API/Vite on ports 3009/5180 and create missing catalog rooms in the test database only. Coverage: validation, pricing, persistence, concurrency across two API instances, direct DB overlap rejection, adjacent stays, cancellation/rebooking, contacts, auth, origin/CSRF checks, session expiry, filters, frontend errors and original responsive layouts.

## Architecture and API

Each room represents **one reservable unit**. Stays use [check-in, check-out) dates, up to 30 nights; children count toward capacity. Prices use integer USD cents from PostgreSQL and are saved with bookings. Creation locks the room row inside a transaction. A PostgreSQL GiST exclusion constraint also rejects overlapping CONFIRMED bookings, including direct writes. Preserve this custom migration; use `prisma migrate deploy`, not `db push`. See [PostgreSQL range constraints](https://www.postgresql.org/docs/16/rangetypes.html#RANGETYPES-CONSTRAINT) and [Prisma custom migrations](https://docs.prisma.io/docs/orm/v6/prisma-migrate/workflows/unsupported-database-features).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/health | Database health |
| GET | /api/rooms | Catalog and nightly cents |
| GET | /api/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD | Available rooms and totals |
| POST | /api/bookings | Create DEMO booking: { stay, guest } |
| POST | /api/bookings/:reference/cancel | Cancel with { cancellationToken } |
| POST | /api/contact | Save DEMO message |
| POST | /api/admin/login, /api/admin/logout | Admin session |
| GET | /api/admin/session | Check authentication |
| GET | /api/admin/bookings?status=CONFIRMED&q=...&page=1 | Filter/search; 50 per page |
| POST | /api/admin/bookings/:reference/cancel | Admin cancellation |
| GET | /api/admin/messages?page=1 | DEMO contacts; 50 per page |

Save the DEMO reference and cancellation token before leaving confirmation. Tokens and guest details stay in React memory; only stay selections persist in localStorage. Reloading full-stack confirmation returns to booking; database records remain available to admins. Cancellation is idempotent and releases inventory. Availability is advisory; final creation returns HTTP 409 for conflicts.

Passwords use salted scrypt hashes. Random 8-hour session tokens are hashed in the DB and sent in HttpOnly, SameSite=Strict cookies (Secure in production). Admin mutations require `X-Aeris-Admin: 1`; cross-origin writes are rejected. Rate limits and bounded request bodies protect endpoints; errors omit internal details. Rate limits are per process; shared limits and HTTPS/proxy configuration would be required before a real deployment. Use a same-origin frontend/API proxy.

Source: `src/` React interface; `server/` API/auth/validation/tests; `prisma/` schema, SQL migration and seed. A patched `deepmerge-ts` override fixes a Prisma tooling advisory. No paid service is required. Do not commit secrets, database data or generated files.
