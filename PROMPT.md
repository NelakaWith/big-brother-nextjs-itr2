# 🚀 Monitoring Dashboard Prompt

You are building a **self-hosted monitoring dashboard** for a VPS.
The stack is:

- **Backend:** Node.js + Express
- **Frontend:** Next.js + TailwindCSS
- **Database:** MySQL
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx

---

## ✅ Requirements

### 1. Database (MySQL schema)

- `users`: id, username, password_hash, created_at
- `apps`: id, name, type (backend|frontend), pm2_name, nginx_server_name, port, created_at
- `logs`: id, app_id, log_type (backend|frontend), log_text, created_at

---

### 2. Backend (Express API)

- `/api/auth/login` → user login with JWT
- `/api/apps` → list apps from MySQL and enrich with PM2 status (uptime, CPU, memory)
- `/api/apps/:id/status` → live metrics for one app from PM2
- `/api/apps/:id/logs` → fetch recent logs (from DB, or stream PM2/nginx logs)
- `/api/apps/register` → add a new app to the DB

**Implementation details:**

- Configurable MySQL connection pool
- JWT-based auth middleware
- Modular routes and controllers

---

### 3. Frontend (Next.js + TailwindCSS)

- **Login page** (JWT-based auth)
- **Dashboard**
  - Table of all apps (`/api/apps`)
  - Show live PM2 status (CPU, memory, uptime)
  - Tabs for backend logs (PM2) and frontend logs (nginx/db)
- Use **SWR** or polling (every 5s) for status updates
- Stream logs with **SSE or WebSocket**

---

### 4. Deployment

- Run both backend and frontend with **PM2**
- Configure **Nginx reverse proxy**:
  - `monitor.mydomain.com` → Next.js frontend
  - `/api` → Express backend

---

## 📌 Output Instructions

Generate **production-ready, modular code** in **small steps**, not one giant file dump.

- Start with backend boilerplate: Express + MySQL + JWT auth + `/api/apps` endpoint
- Then move to frontend scaffold: Next.js with Tailwind + login + dashboard
- Finally wire them up

---

## 🔑 Notes

- Keep code **clean and maintainable** (no overcomplicated abstractions)
- The app should **auto-detect PM2 processes** and show them in the dashboard
- Logs should be **streamed live** and also saved to MySQL
