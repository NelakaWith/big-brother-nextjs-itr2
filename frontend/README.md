Big Brother frontend

Run locally:

1. Install dependencies
   npm install
2. Start dev server (on port 8083)
   npm run dev

This frontend assumes the backend API is available at http://localhost:3002 during development. The Next.js API proxy will forward `/api/*` to that backend. In production, configure Nginx to route `monitor.nelakawithanage.com` to this frontend and `/api` to the backend.
