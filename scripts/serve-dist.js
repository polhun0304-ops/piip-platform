const http = require("http");
const net = require("net");
const fs = require("fs");
const path = require("path");

const port = process.argv[2] ? Number(process.argv[2]) : 5181;
const distDir = path.join(__dirname, "..", "packages", "frontend", "dist");

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".ico")) return "image/x-icon";
  if (file.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

const BACKEND = process.env.BACKEND || "http://localhost:5001";
const backendUrl = new URL(BACKEND);
const isBackendHttps = backendUrl.protocol === "https:";
const backendPort = backendUrl.port
  ? Number(backendUrl.port)
  : isBackendHttps
    ? 443
    : 80;
const proxyHttp = isBackendHttps ? require("https") : require("http");

const server = http.createServer((req, res) => {
  try {
    // Proxy API/socket requests to backend
    const reqPath = decodeURIComponent(req.url.split("?")[0] || "");
    if (reqPath.startsWith("/api") || reqPath.startsWith("/socket.io")) {
      const proxyOptions = {
        hostname: backendUrl.hostname,
        port: backendPort,
        path: req.url,
        method: req.method,
        headers: Object.assign({}, req.headers, { host: backendUrl.host }),
      };

      const proxyReq = proxyHttp.request(proxyOptions, (proxyRes) => {
        // forward status and headers
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      proxyReq.on("error", (err) => {
        res.writeHead(502);
        res.end("Bad Gateway");
      });

      // pipe request body
      req.pipe(proxyReq, { end: true });
      return;
    }

    // sanitize and map to file under dist
    let pathPart = reqPath;
    if (pathPart === "/") pathPart = "/index.html";
    let filePath = path.join(distDir, pathPart);

    // If path is outside dist, serve index.html (SPA fallback)
    if (!filePath.startsWith(distDir)) {
      filePath = path.join(distDir, "index.html");
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // fallback to index.html for SPA routes
      filePath = path.join(distDir, "index.html");
    }

    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    stream.pipe(res);
    stream.on("error", (err) => {
      res.writeHead(500);
      res.end("Internal Server Error");
    });
  } catch (err) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

// Support WebSocket upgrade for socket.io by proxying raw TCP when needed
server.on("upgrade", (req, socket, head) => {
  try {
    const reqPath = decodeURIComponent(req.url.split("?")[0] || "");
    if (!reqPath.startsWith("/socket.io")) {
      socket.destroy();
      return;
    }

    const backendHost = backendUrl.hostname;
    const backendPort = backendUrl.port || 80;

    const backendSocket = net.connect(backendPort, backendHost, () => {
      // write initial request (raw) to backend socket
      backendSocket.write(
        `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`
      );
      // forward headers
      for (const [name, value] of Object.entries(req.headers || {})) {
        backendSocket.write(`${name}: ${value}\r\n`);
      }
      backendSocket.write("\r\n");
      backendSocket.write(head);
      // pipe between sockets
      socket.pipe(backendSocket);
      backendSocket.pipe(socket);
    });

    backendSocket.on("error", () => {
      try {
        socket.destroy();
      } catch (e) {}
    });
  } catch (err) {
    try {
      socket.destroy();
    } catch (e) {}
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving ${distDir} on http://0.0.0.0:${port}`);
});

process.on("SIGINT", () => process.exit(0));
