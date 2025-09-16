# Big Brother — Local development

This repository contains a small self-hosted monitoring dashboard: an Express backend and a Vite + React frontend.

## Quick start (PowerShell)

1. Start the backend (defaults to port 3002):

```powershell
cd backend
npm install
$env:PORT=3002
npm run dev
```

2. Start the frontend (Vite) and point it to the backend:

```powershell
cd frontend
npm install
# optional: set the backend target used by the dev proxy
$env:VITE_BACKEND_URL='http://localhost:3002'
npm run dev
```

## Files and helpers

- `run-local.ps1`, `run-dev.bat` — convenience scripts that start backend and frontend for local development.
- `frontend/.env.local.example` — example env for the frontend (VITE_BACKEND_URL).
- `backend/.env.local.example` — example env for the backend (DB, JWT_SECRET, etc.).

## Seeding an admin user

From the `backend` folder run:

```powershell
node seed/create_admin.js
```

## Auth and token refresh

- The backend issues JWTs on `/api/auth/login`.
- The frontend stores the JWT in `localStorage` under `bb_token`.
- The frontend will attempt to refresh an expired token by calling `/api/auth/refresh` (this endpoint accepts the existing token and returns a new one). If refresh fails the user is redirected to `/login`.
- EventSource (SSE) connections attach the token as `?token=...` in the URL since SSE doesn't support custom headers.

## Running tests

Unit tests (Vitest + Testing Library):

```powershell
cd frontend
npm install
npm run test:unit
```

E2E tests (Playwright):

1. Install Playwright browsers (one-time):

   ```powershell
   npx playwright install
   ```

2. Ensure backend and frontend dev servers are running, then:

   ```powershell
   cd frontend
   npm run test:e2e
   ```

## Troubleshooting

- ERESOLVE dependency errors: if you see npm ERESOLVE peer dependency errors, try using the package versions in `frontend/package.json` (this repo pins `vite` to a v4.x line that is compatible with `@vitejs/plugin-react@4.x`). If you get similar errors, run `npm install --legacy-peer-deps` or use the pinned versions.
- Playwright: if Playwright e2e tests fail due to missing browsers, run `npx playwright install`.
- Backend DB: ensure MySQL is running and credentials in `backend/.env` are correct before running migrations or seeds.

## Security

- This project uses simple JWTs for local development. Do not use these credentials/secrets in production. Use secure secret management in real deployments.

## Next steps I can help with

- Start both servers here and run the unit + e2e tests and report results.
- Add a GitHub Actions workflow to run unit and e2e tests on push/PR.
