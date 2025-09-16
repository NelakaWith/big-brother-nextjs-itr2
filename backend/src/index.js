require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const http = require("http");
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

// routes
const appsRouter = require("./routes/apps");
const authRouter = require("./routes/auth");

app.use("/api/auth", authRouter);
app.use("/api/apps", appsRouter);

app.get("/", (req, res) =>
  res.json({ ok: true, service: "big-brother-backend" })
);

const server = http.createServer(app);

// attach websocket server
try {
  const { attachWSServer } = require("./wsServer");
  attachWSServer(server);
  console.log("WebSocket server attached");
} catch (err) {
  console.warn("Failed to attach WebSocket server", err && err.message);
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
