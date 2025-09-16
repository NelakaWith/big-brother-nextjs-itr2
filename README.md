# Big Brother — Local development

This repo contains a small self-hosted monitoring dashboard (backend + frontend). The following notes explain how to run the project locally and configure environment variables.

Quick start (PowerShell)

1. Start the backend on port 3002 (matches frontend proxy fallback):

```powershell
$env:PORT=3002
cd backend
npm install
npm run dev
```

2. Start the frontend and point it to the backend:

```powershell
$env:BACKEND_URL='http://localhost:3002'
cd frontend
npm install
npm run dev
```

Runners included

- `run-local.ps1` — PowerShell runner that starts backend and frontend in separate processes (uses npm dev scripts).
- `run-dev.bat` — Minimal batch file that starts backend and frontend (starts http://localhost:5173 by default; change if your frontend runs on 8083).
- `run-separate.bat` / `run-local.bat` — other helpers to start the app and capture logs.

Environment examples

- `backend/.env.local.example` — copy to `backend/.env.local` or set variables in your environment.
- `frontend/.env.local.example` — copy to `frontend/.env.local` or set variables in your environment.

Seeding admin user

From the `backend` folder, run:

```powershell
node seed/create_admin.js
```

Notes

- Do not commit real secrets. Use `.env.local` or your OS/service secret manager.
- The frontend proxy in `frontend/pages/api/[...proxy].js` forwards `/api` to the backend target set by `BACKEND_URL` or `http://localhost:3002` by default.
- If you change backend port, set `BACKEND_URL` before starting the frontend.
