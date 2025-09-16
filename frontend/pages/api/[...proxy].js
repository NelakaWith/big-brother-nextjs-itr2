import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // strip /api and forward to backend
  const target = process.env.BACKEND_URL || "http://localhost:3002";
  req.url = req.url.replace(/^\/api/, "");

  // return a Promise so Next.js waits for proxy to complete
  await new Promise((resolve) => {
    proxy.once("proxyRes", function (proxyRes, req2, res2) {
      // proxy succeeded
      resolve();
    });

    proxy.once("error", function (err, req2, res2) {
      console.error("proxy error", err && err.message);
      try {
        if (!res2.headersSent) {
          res2.statusCode = 502;
          res2.setHeader("content-type", "application/json");
          res2.end(JSON.stringify({ error: "Bad gateway" }));
        } else {
          res2.end();
        }
      } catch (e) {
        // ignore
      }
      resolve();
    });

    proxy.web(req, res, { target, changeOrigin: true });
  });
}
