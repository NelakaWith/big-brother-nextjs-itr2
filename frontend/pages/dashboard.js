import useSWR from "swr";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: "Bearer " + localStorage.getItem("bb_token") },
  }).then((r) => r.json());

function useApps() {
  const { data, error, mutate } = useSWR("/api/apps", fetcher, {
    refreshInterval: 5000,
  });
  return { data: data?.data || [], loading: !data && !error, error, mutate };
}

function LogViewer({ app }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    if (!app) return;
    const token = localStorage.getItem("bb_token");
    const es = new EventSource(
      `/api/apps/${app.id}/logs/stream?token=${encodeURIComponent(token)}`
    );
    es.onmessage = (e) => {
      try {
        const obj = JSON.parse(e.data);
        setLogs((l) => [obj, ...l].slice(0, 200));
      } catch (err) {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [app?.id]);
  return (
    <div className="mt-4">
      <h4 className="font-semibold">Live logs</h4>
      <div className="bg-black text-white p-3 rounded h-64 overflow-auto font-mono text-sm">
        {logs.map((l, i) => (
          <div key={i}>
            [{new Date(l.created_at).toLocaleTimeString()}] {l.log_text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: apps, loading } = useApps();
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("bb_token")) router.push("/login");
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div>
          <button
            onClick={() => {
              localStorage.removeItem("bb_token");
              router.push("/login");
            }}
            className="px-3 py-1 border rounded"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Name</th>
              <th>Type</th>
              <th>PM2</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Uptime</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td>{a.name}</td>
                <td>{a.type}</td>
                <td>{a.pm2?.name || "-"}</td>
                <td>{a.pm2?.monit?.cpu ?? "-"}</td>
                <td>
                  {a.pm2?.monit?.memory
                    ? Math.round(a.pm2.monit.memory / 1024 / 1024) + "MB"
                    : "-"}
                </td>
                <td>
                  {a.pm2?.pm2_env?.pm_uptime
                    ? new Date(a.pm2.pm2_env.pm_uptime).toLocaleString()
                    : "-"}
                </td>
                <td>
                  <button
                    onClick={() => router.push(`/apps/${a.id}`)}
                    className="px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* per-app page handles logs now */}
    </div>
  );
}
