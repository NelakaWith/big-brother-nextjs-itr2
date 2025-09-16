import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("adminpass");
  const [err, setErr] = useState(null);
  const router = useRouter();

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
      router.push("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="container">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-20">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={submit}>
          <label className="block mb-2">Username</label>
          <input
            className="w-full p-2 border rounded mb-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="block mb-2">Password</label>
          <input
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
