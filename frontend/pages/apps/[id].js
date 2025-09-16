import { useRouter } from "next/router";
import useSWR from "swr";
import Tabs from "../../components/Tabs";
import LogList from "../../components/LogList";
import { useState } from "react";

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: "Bearer " + localStorage.getItem("bb_token") },
  }).then((r) => r.json());

export default function AppPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useSWR(id ? `/api/apps/${id}/status` : null, fetcher);
  const app = data?.data?.app;
  const [tab, setTab] = useState("Backend");

  if (!id) return null;
  if (!app) return <div className="container">Loading app...</div>;

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{app.name}</h1>
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1 border rounded"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <strong>Type</strong>
            <div>{app.type}</div>
          </div>
          <div>
            <strong>PM2</strong>
            <div>{app.pm2?.name || "-"}</div>
          </div>
          <div>
            <strong>Port</strong>
            <div>{app.port || "-"}</div>
          </div>
        </div>
      </div>

      <Tabs tabs={["Backend", "Frontend"]} active={tab} onChange={setTab} />

      {tab === "Backend" && (
        <LogList
          fetchUrl={`/api/apps/${id}/logs`}
          streamUrl={`/api/apps/${id}/logs/stream`}
        />
      )}

      {tab === "Frontend" && (
        <div>
          <p className="mb-2 text-sm text-gray-600">
            Frontend logs are expected to come from nginx or DB.
          </p>
          <LogList fetchUrl={`/api/apps/${id}/logs`} streamUrl={null} />
        </div>
      )}
    </div>
  );
}
