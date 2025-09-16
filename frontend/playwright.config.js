// Playwright configuration for e2e tests
const { devices } = require("@playwright/test");

module.exports = {
  testDir: "./tests",
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    baseURL: process.env.VITE_E2E_BASE_URL || "http://localhost:5173",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
};
