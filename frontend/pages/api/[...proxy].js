import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  // strip /api and forward to backend
  const target = process.env.BACKEND_URL || "http://localhost:3002";
  req.url = req.url.replace(/^\/api/, "");
  proxy.web(req, res, { target }, (e) => {
    console.error("proxy error", e);
    res.status(502).json({ error: "Bad gateway" });
  });
}
