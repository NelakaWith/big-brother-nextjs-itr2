const WebSocket = require("ws");
const { verifyToken, getTokenFromReq } = require("./auth");
const { onLog } = require("./pm2LogStreamer");

function attachWSServer(server) {
  const wss = new WebSocket.Server({ server, path: "/ws/logs" });

  wss.on("connection", (ws, req) => {
    // expect token in query param
    const token =
      getTokenFromReq(req) ||
      (req.url &&
        new URL(req.url, `http://${req.headers.host}`).searchParams.get(
          "token"
        ));
    if (!token) return ws.close(1008, "Unauthorized");
    let user;
    try {
      user = verifyToken(token);
    } catch (err) {
      return ws.close(1008, "Invalid token");
    }

    // allow client to send a message to subscribe: { action: 'sub', app_id: 123 }
    ws.subscriptions = new Set();
    ws.on("message", (msg) => {
      try {
        const obj = JSON.parse(msg.toString());
        if (obj.action === "sub" && obj.app_id)
          ws.subscriptions.add(Number(obj.app_id));
        if (obj.action === "unsub" && obj.app_id)
          ws.subscriptions.delete(Number(obj.app_id));
      } catch (err) {}
    });

    const off = onLog((ev) => {
      try {
        if (ev.app_id && ws.subscriptions.has(Number(ev.app_id))) {
          ws.send(JSON.stringify(ev));
        }
      } catch (err) {}
    });

    ws.on("close", () => {
      off();
    });
  });
}

module.exports = { attachWSServer };
