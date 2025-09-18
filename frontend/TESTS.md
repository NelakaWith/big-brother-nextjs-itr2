Unit tests (Vitest)

1. Install dependencies
   cd frontend
   npm install

2. Run unit tests
   npm run test:unit

Playwright e2e (headless)

1. Install Playwright browsers (only once)
   npx playwright install

2. Ensure backend and frontend dev server are running:

   - backend: npm run dev (must be running on the port VITE_BACKEND_URL uses)
   - frontend: npm run dev (Vite defaults to http://localhost:5173)

3. Run e2e tests
   npm run test:e2e

Notes

- Playwright config uses baseURL from VITE_E2E_BASE_URL or http://localhost:5173 by default.
- The e2e tests assume a seeded admin user exists with credentials `admin` / `adminpass`.
