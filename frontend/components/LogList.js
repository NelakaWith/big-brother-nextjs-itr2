import { useEffect, useState, useRef } from 'react'

export default function LogList({ fetchUrl, streamUrl }){
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('')
  const esRef = useRef(null)
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const res = await fetch(fetchUrl, { headers: { Authorization: 'Bearer '+localStorage.getItem('bb_token') } })
        const data = await res.json()
        if (mounted && data && data.data) setLogs(data.data)
      }catch(err){ console.warn('load logs', err) }
    }
    load()

    function startWebSocket(appId){
      if (wsRef.current) try{ wsRef.current.close() }catch(e){}
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
      const host = location.host
      const token = localStorage.getItem('bb_token')
      const url = `${protocol}://${host}/ws/logs?token=${encodeURIComponent(token)}`
      const ws = new WebSocket(url)
      wsRef.current = ws
      ws.onopen = ()=>{
        ws.send(JSON.stringify({ action: 'sub', app_id: appId }))
      }
      ws.onmessage = (ev)=>{
        try{ const obj = JSON.parse(ev.data); setLogs(l=>[obj, ...l].slice(0,500)) }catch(e){}
      }
      ws.onclose = ()=>{
        // try reconnect after 3s
        reconnectRef.current = setTimeout(()=> startWebSocket(appId), 3000)
      }
      ws.onerror = ()=>{ try{ ws.close() }catch(e){} }
    }

    if (streamUrl) {
      const token = localStorage.getItem('bb_token')
      const url = streamUrl + (streamUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token)
      const es = new EventSource(url)
      es.onmessage = (e)=>{ try{ const obj = JSON.parse(e.data); setLogs(l=>[obj, ...l].slice(0,500)) }catch(e){} }
      es.onerror = ()=>{
        try{ es.close() }catch(e){}
        // fallback to websocket
        const m = streamUrl.match(/\/api\/apps\/(\d+)\/logs/)
        const appId = m ? Number(m[1]) : null
        if (appId) startWebSocket(appId)
      }
      esRef.current = es
    }

    return ()=>{
      mounted = false
      if (esRef.current) try{ esRef.current.close() }catch(e){}
      if (wsRef.current) try{ wsRef.current.close() }catch(e){}
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
    }
  }, [fetchUrl, streamUrl])

  const filtered = filter ? logs.filter(l=> (l.log_text||'').toLowerCase().includes(filter.toLowerCase())) : logs

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input placeholder="Filter logs..." value={filter} onChange={e=>setFilter(e.target.value)} className="border p-2 rounded w-full" />
        <div className="text-sm text-gray-500">Showing {filtered.length}</div>
      </div>
      <div className="bg-black text-white p-3 rounded h-72 overflow-auto font-mono text-sm">
        {filtered.map((l,i)=>(<div key={i} className="mb-1">[{new Date(l.created_at).toLocaleTimeString()}] {l.log_text}</div>))}
      </div>
    </div>
  )
}
import { useEffect, useState, useRef } from "react";

export default function LogList({ fetchUrl, streamUrl }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const esRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(fetchUrl, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("bb_token"),
          },
        });
        const data = await res.json();
        if (mounted && data && data.data) setLogs(data.data);
      } catch (err) {
        console.warn("load logs", err);
      }
    }
    load();

    if (streamUrl) {
      const token = localStorage.getItem("bb_token");
      const url =
        streamUrl +
        (streamUrl.includes("?") ? "&" : "?") +
        "token=" +
        encodeURIComponent(token);
      const es = new EventSource(url);
      es.onmessage = (e) => {
        try {
          const obj = JSON.parse(e.data);
          setLogs((l) => [obj, ...l].slice(0, 500));
        } catch (e) {}
      };
      es.onerror = () => {
        es.close();
      };
      esRef.current = es;
    }

    return () => {
      mounted = false;
      if (esRef.current) esRef.current.close();
    };
  }, [fetchUrl, streamUrl]);

  const filtered = filter
    ? logs.filter((l) =>
        (l.log_text || "").toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <div className="text-sm text-gray-500">Showing {filtered.length}</div>
      </div>
      <div className="bg-black text-white p-3 rounded h-72 overflow-auto font-mono text-sm">
        {filtered.map((l, i) => (
          <div key={i} className="mb-1">
            [{new Date(l.created_at).toLocaleTimeString()}] {l.log_text}
          </div>
        ))}
      </div>
    </div>
  );
}
