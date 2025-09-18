const express = require("express");
const router = express.Router();
const {
  listApps,
  registerApp,
  getAppStatus,
  getAppLogs,
  streamAppLogs,
} = require("../controllers/appsController");
const { authMiddleware } = require("../auth");

// get all apps (protected)
router.get("/", authMiddleware, listApps);
// register new app
router.post("/register", authMiddleware, registerApp);
// get one app status
router.get("/:id/status", authMiddleware, getAppStatus);
// get recent logs
router.get("/:id/logs", authMiddleware, getAppLogs);
// stream logs (SSE)
router.get("/:id/logs/stream", authMiddleware, streamAppLogs);

module.exports = router;
