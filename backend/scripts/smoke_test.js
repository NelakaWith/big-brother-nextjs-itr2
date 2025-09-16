const axios = require("axios");

const BACKEND = process.env.BACKEND_URL || "http://localhost:3002";

async function main() {
  try {
    console.log("Checking root...");
    const root = await axios.get(`${BACKEND}/`);
    if (!root.data || !root.data.service) throw new Error("root check failed");
    console.log("OK root");

    console.log("Testing login...");
    const loginRes = await axios.post(`${BACKEND}/api/auth/login`, {
      username: "admin",
      password: process.env.ADMIN_PASSWORD || "adminpass",
    });
    if (!loginRes.data || !loginRes.data.token) throw new Error("login failed");
    const token = loginRes.data.token;
    console.log("OK login");

    console.log("Testing GET /api/apps (should be empty or list)");
    const appsRes = await axios.get(`${BACKEND}/api/apps`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!appsRes.data) throw new Error("/api/apps failed");
    console.log("OK /api/apps");

    console.log("Testing register app");
    const reg = await axios.post(
      `${BACKEND}/api/apps/register`,
      { name: "smoke-app", type: "backend", pm2_name: "smoke-app" },
      { headers: { Authorization: "Bearer " + token } }
    );
    if (!reg.data || !reg.data.data || !reg.data.data.id)
      throw new Error("register failed");
    const appId = reg.data.data.id;
    console.log("OK register -> id", appId);

    console.log("Testing get status for id", appId);
    const status = await axios.get(`${BACKEND}/api/apps/${appId}/status`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!status.data || !status.data.data) throw new Error("status failed");
    console.log("OK status");

    console.log("Smoke tests passed");
    process.exit(0);
  } catch (err) {
    console.error("Smoke test failed:");
    if (err && err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    console.error("Error message:", err && err.message);
    if (err && err.stack) console.error(err.stack);
    process.exit(2);
  }
}

main();
