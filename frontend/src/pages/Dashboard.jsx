import { useEffect, useState, useRef } from "react";
import {
  authFetch,
  sseUrl,
  getToken,
  isTokenExpired,
  refreshToken,
  clearToken,
} from "../lib/api";
import { useNavigate } from "react-router-dom";

function AppRow({ app }) {
  return (
    <div className="p-2 border rounded mb-2 flex justify-between items-center">
      <div>
        <div className="font-semibold">{app.name}</div>
        <div className="text-sm text-gray-600">id: {app.id}</div>
      </div>
      <div className="text-sm">{app.pid ? "Running" : "Stopped"}</div>
    </div>
  );
}

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const esRef = useRef(null);
  const containerRef = useRef(null);
  const nav = useNavigate();

  // on mount check token expiry and try refresh
  useEffect(() => {
    const t = getToken();
    if (!t) {
      nav("/login");
      return;
    }
    if (isTokenExpired(t)) {
      refreshToken().then((nt) => {
        if (!nt) {
          clearToken();
          nav("/login");
        }
      });
    }
  }, []);

  useEffect(() => {
    authFetch("/api/apps")
      .then((r) => r.json())
      .then((d) => setApps(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLogs([]);

    // SSE streaming
    const s = new EventSource(sseUrl(`/api/apps/${selected.id}/logs/stream`));
    s.onmessage = (ev) => {
      try {
        const obj = JSON.parse(ev.data);
        setLogs((prev) => {
          const next = [...prev, obj].slice(-500);
          return next;
        });
        // auto-scroll
        setTimeout(() => {
          if (containerRef.current)
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }, 0);
      } catch (e) {}
    };
    s.onerror = () => {
      s.close();
    };
    esRef.current = s;
    return () => s.close();
  }, [selected]);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Apps</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>
          {apps.map((a) => (
            <div key={a.id} onClick={() => setSelected(a)}>
              <AppRow app={a} />
            </div>
          ))}
        </div>
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl">Logs</h2>
            <div className="flex items-center gap-2">
              <input
                placeholder="filter logs"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-1 border rounded"
              />
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => {
                  clearToken();
                  nav("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
          <div
            ref={containerRef}
            className="h-96 overflow-auto bg-black text-white p-3 rounded"
          >
            {logs
              .filter(
                (l) =>
                  !filter ||
                  (l.message &&
                    l.message.toLowerCase().includes(filter.toLowerCase()))
              )
              .map((l, i) => (
                <div key={i} className="text-xs">
                  {new Date(l.time).toLocaleTimeString()} {l.message}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
