const EventEmitter = require("events");
const pm2 = require("pm2");
const db = require("./db");

const emitter = new EventEmitter();

let connected = false;

function safeConnect() {
  if (connected) return;
  pm2.connect((err) => {
    if (err) return;
    connected = true;
    pm2.launchBus((err2, bus) => {
      if (err2) return;
      bus.on("log:out", async (packet) => handlePacket("out", packet));
      bus.on("log:err", async (packet) => handlePacket("err", packet));
    });
  });
}

async function handlePacket(type, packet) {
  try {
    // packet contains { data, process: { name, pm_id, pm_uptime }, at }
    const text =
      packet.data && packet.data.toString
        ? packet.data.toString()
        : String(packet.data || "");
    const proc = packet.process || {};
    const pm2_name = proc.name || null;
    const created_at = new Date();

    // try to resolve app_id by pm2_name
    let appId = null;
    if (pm2_name) {
      const [rows] = await db.query(
        "SELECT id FROM apps WHERE pm2_name = ? LIMIT 1",
        [pm2_name]
      );
      if (rows && rows.length) appId = rows[0].id;
    }

    const log_type = "backend";
    // insert into logs table if we have an appId, otherwise skip DB insert
    let insertRow = null;
    if (appId) {
      const [result] = await db.query(
        "INSERT INTO logs (app_id, log_type, log_text) VALUES (?, ?, ?)",
        [appId, log_type, text]
      );
      insertRow = {
        id: result.insertId,
        app_id: appId,
        log_type,
        log_text: text,
        created_at,
      };
    }

    // emit an event for any listeners (include appId if known)
    emitter.emit("log", {
      pm2_name,
      app_id: appId,
      log_type,
      log_text: text,
      created_at,
      raw: packet,
    });
  } catch (err) {
    console.error("pm2LogStreamer handlePacket error", err);
  }
}

function onLog(cb) {
  emitter.on("log", cb);
  // ensure pm2 connection started
  safeConnect();
  return () => emitter.off("log", cb);
}

module.exports = { onLog };
