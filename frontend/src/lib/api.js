export function getToken() {
  try {
    return localStorage.getItem("bb_token");
  } catch (e) {
    return null;
  }
}

export function setToken(t) {
  try {
    localStorage.setItem("bb_token", t);
  } catch (e) {}
}

export function clearToken() {
  try {
    localStorage.removeItem("bb_token");
  } catch (e) {}
}

function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token) {
  const p = parseJwtPayload(token);
  if (!p || !p.exp) return true;
  // exp is in seconds
  return Date.now() / 1000 > p.exp - 10; // 10s leeway
}

export async function refreshToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.token) {
      setToken(data.token);
      return data.token;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function authFetch(path, opts = {}) {
  const headers = opts.headers ? { ...opts.headers } : {};
  let token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(path, { ...opts, headers });
  if (response.status !== 401) return response;
  // try refresh once
  const newToken = await refreshToken();
  if (!newToken) return response;
  headers["Authorization"] = `Bearer ${newToken}`;
  return fetch(path, { ...opts, headers });
}

export function sseUrl(path) {
  const token = getToken();
  if (!token) return path;
  return `${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(
    token
  )}`;
}
