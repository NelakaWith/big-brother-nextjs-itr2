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

## How it works

This project is a small self-hosted monitoring system composed of:

- Backend: Express (Node.js) provides REST endpoints, authentication (JWT), and streaming endpoints for logs.
- Frontend: Vite + React + Tailwind UI that lists registered apps and shows live logs.
- Log ingestion: a small PM2 helper listens to PM2's internal bus and writes app logs into the database, then emits events for connected clients.

High-level flow:

1. Apps are registered in the `apps` table (manually or via the `/api/apps/register` endpoint).
2. The backend's PM2 log streamer (`backend/src/pm2LogStreamer.js`) connects to the PM2 bus and receives `log:out` / `log:err` packets. When a packet is associated with a known `pm2_name` (an entry in `apps`), the streamer inserts a row into the `logs` table and emits a log event.
3. Clients (the React frontend) can consume live logs in two ways:
   - Server-Sent Events (SSE): the frontend opens an `EventSource` to `/api/apps/:id/logs/stream`. The backend stream endpoint (`streamAppLogs`) listens to the pm2 log events and forwards matching events to the SSE client.
   - WebSockets: the backend also exposes a WebSocket server at `/ws/logs` (see `backend/src/wsServer.js`). WebSocket clients authenticate with the JWT (passed as `?token=`) and then send `{ action: 'sub', app_id: 123 }` to subscribe to a specific app's logs. The server pushes log events to subscribed clients.
4. The frontend currently uses SSE for one-way streaming (log tail). SSE is simple and well-suited for streaming log lines; WebSockets are available if you need bi-directional communication or lower overhead for many clients.

Where to look in the codebase

- PM2 log ingestion and event emission: `backend/src/pm2LogStreamer.js`
- WebSocket server that streams logs: `backend/src/wsServer.js`
- SSE streaming endpoint and log controllers: `backend/src/controllers/appsController.js` (see `streamAppLogs`)
- Frontend SSE consumer: `frontend/src/pages/Dashboard.jsx` (uses `EventSource`) and helper `frontend/src/lib/api.js` for auth and SSE URL building.

Notes and operational tips

- Authentication: both SSE and WebSocket endpoints expect a valid JWT. SSE clients pass the token as a `?token=` query parameter because EventSource cannot set custom headers.
- PM2 dependency: the PM2 log streamer calls `pm2.connect()` and `pm2.launchBus()` to subscribe to the PM2 event bus. In development without PM2, the streamer fails gracefully and log insertion is skipped.
- Performance: the app inserts log rows into MySQL for persistence. If you expect a high log volume, consider writing logs to a time-series store or batching inserts.

### Architecture diagram

If your renderer supports Mermaid, this diagram shows the high-level flow (PM2 ingestion, DB persistence, event emission, and client streaming). This layout follows GitHub's Mermaid support and should render in README previews.

````mermaid
```mermaid
flowchart LR
   A[App PM2] --> PM2[PM2 bus]
   PM2 --> LStreamer[pm2LogStreamer]
   LStreamer --> DB[(MySQL logs)]
   LStreamer --> Evt[EventEmitter]

   Evt --> Backend[Express API]
   Backend --> FrontendSSE[Frontend SSE]
   Backend --> FrontendWS[Frontend WS]
   Backend --> FrontendAPI[Frontend REST]

   Emit[emit_log.js] --> Evt
   Vite[Vite dev server] --> Backend
   FrontendSSE --> FrontendAPI

````

````

ASCII fallback:

App (PM2) --logs--> PM2 bus --packets--> pm2LogStreamer --> DB (logs)
|
+--> EventEmitter --> Backend --> SSE / WS --> Frontend
|
+--> (emit_log.js) test emitter (dev)

### How to test streaming locally

You have two main ways to test live streaming: using PM2 to produce real log events, or using the included test emitter to simulate events without PM2.

1. Test with PM2 (real logs)

```bash
# start a tiny process that prints a timestamp every second
pm2 start --name smoke-app --interpreter bash -- "-lc" "while true; do echo \"hello $(date)\"; sleep 1; done"
````

```bash
# using wscat (npm i -g wscat)
wscat -c "ws://127.0.0.1:3002/ws/logs?token=<JWT>"
# then subscribe
> { "action": "sub", "app_id": 1 }
```

2. Test without PM2 (quick emitter)

We've added a tiny helper that lets you emit a log event directly from the repo without PM2. This is useful for development and CI.

```powershell
# from repository root
node backend/scripts/emit_log.js 1 "Test message from emitter"
```

The script calls into the same EventEmitter used by the PM2 streamer so connected SSE or WebSocket clients will receive the message. The first argument is optional (app id). If provided and the DB is writable the event will also be persisted to the `logs` table.

This script calls into the pm2 log emitter and will cause any connected SSE or WebSocket clients subscribed to `app_id=1` to receive the event. Note: this does not persist a row into the `logs` table — it's only an emitted event for live testing.

3. Notes

- SSE: open the Dashboard and pick an app. The frontend uses EventSource to `/api/apps/:id/logs/stream` and will show emitted events.
- WS: use `wscat` or a simple Node script to connect to `ws://127.0.0.1:3002/ws/logs?token=<JWT>`, then send `{ "action": "sub", "app_id": <id> }` to subscribe.
- Auth: both SSE and WS require a valid JWT (SSE via `?token=` query param; WS also accepts `?token=`).
