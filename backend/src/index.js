require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const http = require("http");
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

// simple request logger - prints method/path/timestamp and remote ip
app.use((req, res, next) => {
  try {
    const now = new Date().toISOString();
    const remote =
      req.ip || (req.connection && req.connection.remoteAddress) || "-";
    console.log(
      `[req] ${now} ${req.method} ${req.originalUrl} remote=${remote}`
    );
  } catch (e) {
    // logging should not break request handling
  }
  next();
});

// response duration logger
app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  res.end = function (...args) {
    const dur = Date.now() - start;
    try {
      // only log responses with error status codes (>=400)
      if (res.statusCode >= 400) {
        console.error(
          `[res] ${new Date().toISOString()} ${req.method} ${
            req.originalUrl
          } status=${res.statusCode} time=${dur}ms`
        );
      }
    } catch (e) {}
    return originalEnd.apply(this, args);
  };
  next();
});

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
} catch (err) {
  console.error("Failed to attach WebSocket server", err && err.message);
}

server.listen(PORT, "127.0.0.1");
