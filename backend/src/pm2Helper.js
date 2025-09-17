const pm2 = require("pm2");

function listProcesses() {
  return new Promise((resolve, reject) => {
    // guard in case pm2.connect/list hangs: timeout after 1500ms
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        pm2.disconnect();
      } catch (e) {}
      reject(new Error("pm2 connect timeout"));
    }, 1500);

    pm2.connect((err) => {
      if (timedOut) return;
      if (err) {
        clearTimeout(timer);
        return reject(err);
      }
      pm2.list((err2, procs) => {
        clearTimeout(timer);
        try {
          pm2.disconnect();
        } catch (e) {}
        if (err2) return reject(err2);
        resolve(procs || []);
      });
    });
  });
}

async function findProcessByName(name) {
  try {
    const procs = await listProcesses();
    const p = procs.find(
      (x) =>
        x.name === name ||
        (x.pm2_env &&
          x.pm2_env.pm_exec_path &&
          x.pm2_env.pm_exec_path.includes(name))
    );
    if (!p) return null;
    return {
      pid: p.pid,
      name: p.name,
      pm_id: p.pm_id,
      monit: p.monit || {},
      pm2_env: p.pm2_env || {},
    };
  } catch (err) {
    return null;
  }
}

module.exports = { listProcesses, findProcessByName };
