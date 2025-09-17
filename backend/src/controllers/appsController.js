const db = require("../db");
const { findProcessByName } = require("../pm2Helper");
const { onLog } = require("../pm2LogStreamer");

async function listApps(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM apps ORDER BY id DESC");
    // enrich with pm2 status - fetch process list once to avoid repeated connects
    let procs = [];
    try {
      procs = await require("../pm2Helper").listProcesses();
    } catch (e) {
      // If pm2 isn't available, continue without it
      procs = [];
    }
    const enriched = rows.map((app) => {
      let pm2info = null;
      try {
        if (app.pm2_name && procs && procs.length) {
          const p = procs.find(
            (x) =>
              x.name === app.pm2_name ||
              (x.pm2_env &&
                x.pm2_env.pm_exec_path &&
                x.pm2_env.pm_exec_path.includes(app.pm2_name))
          );
          if (p)
            pm2info = {
              pid: p.pid,
              name: p.name,
              pm_id: p.pm_id,
              monit: p.monit || {},
              pm2_env: p.pm2_env || {},
            };
        }
      } catch (e) {}
      return Object.assign({}, app, { pm2: pm2info });
    });
    res.json({ ok: true, data: enriched });
  } catch (err) {
    console.error("listApps error", err);
    res.status(500).json({ error: "Internal error" });
  }
}

async function registerApp(req, res) {
  const { name, type, pm2_name, nginx_server_name, port } = req.body || {};
  if (!name || !type)
    return res.status(400).json({ error: "name and type required" });
  try {
    const [result] = await db.query(
      "INSERT INTO apps (name, type, pm2_name, nginx_server_name, port) VALUES (?, ?, ?, ?, ?)",
      [name, type, pm2_name || null, nginx_server_name || null, port || null]
    );
    const [rows] = await db.query("SELECT * FROM apps WHERE id = ? LIMIT 1", [
      result.insertId,
    ]);
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("registerApp error", err);
    res.status(500).json({ error: "Internal error" });
  }
}

async function getAppStatus(req, res) {
  const id = Number(req.params.id);
  try {
    const [rows] = await db.query("SELECT * FROM apps WHERE id = ? LIMIT 1", [
      id,
    ]);
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "App not found" });
    const app = rows[0];
    let pm2info = null;
    if (app.pm2_name) pm2info = await findProcessByName(app.pm2_name);
    res.json({ ok: true, data: { app, pm2: pm2info } });
  } catch (err) {
    console.error("getAppStatus error", err);
    res.status(500).json({ error: "Internal error" });
  }
}

async function getAppLogs(req, res) {
  const id = Number(req.params.id);
  try {
    const [rows] = await db.query(
      "SELECT * FROM logs WHERE app_id = ? ORDER BY id DESC LIMIT 200",
      [id]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("getAppLogs error", err);
    res.status(500).json({ error: "Internal error" });
  }
}

function streamAppLogs(req, res) {
  const id = Number(req.params.id);
  // SSE headers
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  const onLogCb = (ev) => {
    if (ev.app_id === id) {
      const payload = JSON.stringify({
        app_id: ev.app_id,
        log_type: ev.log_type,
        log_text: ev.log_text,
        created_at: ev.created_at,
      });
      res.write(`data: ${payload}\n\n`);
    }
  };

  const off = onLog(onLogCb);

  // send a ping every 20s to keep connection alive
  const ping = setInterval(() => res.write(": ping\n\n"), 20000);

  req.on("close", () => {
    clearInterval(ping);
    off();
  });
}

module.exports = {
  listApps,
  registerApp,
  getAppStatus,
  getAppLogs,
  streamAppLogs,
};
