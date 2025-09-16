import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("adminpass");
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("bb_token", data.token);
      nav("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={submit}>
          <input
            name="username"
            placeholder="username"
            className="w-full p-2 border rounded mb-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            name="password"
            placeholder="password"
            type="password"
            className="w-full p-2 border rounded mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <div className="text-red-600 mb-2">{err}</div>}
          <button className="w-full bg-blue-600 text-white p-2 rounded">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
