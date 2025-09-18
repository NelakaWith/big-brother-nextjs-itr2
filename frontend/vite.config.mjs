import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 8083,
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
