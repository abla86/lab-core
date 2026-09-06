import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
if (!host.trim()) throw new Error("HOST must not be empty");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be an integer between 1 and 65535");
const labs = [
  { id: "game", name: "GAME LAB", description: "10 engines · AI · systems" },
  { id: "evidence", name: "EVIDENCE LAB", description: "appraisal · synthesis" },
  { id: "security", name: "SECURITY LAB", description: "identity · protocols" },
  { id: "data", name: "DATA LAB", description: "SQL · planning · streams" },
  { id: "devops", name: "DEVOPS LAB", description: "CI/CD · pipelines" },
  { id: "systems", name: "SYSTEMS LAB", description: "WASM · workers · runtime" }
];

const headers = {
  "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { ...headers, "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendFile(res, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, requested);
  let realFile;
  try {
    realFile = fs.realpathSync(file);
  } catch {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  let realRoot;
  try {
    realRoot = fs.realpathSync(root);
  } catch {
    sendJson(res, 500, { error: "Internal server error" });
    return;
  }
  let stat;
  try {
    stat = fs.statSync(realFile);
  } catch {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  if ((realFile !== realRoot && !realFile.startsWith(realRoot + path.sep)) || !stat.isFile()) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
  if (!(path.extname(file) in types)) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  res.writeHead(200, { ...headers, "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
  const stream = fs.createReadStream(realFile);
  stream.on("error", () => {
    if (!res.headersSent) sendJson(res, 500, { error: "Internal server error" });
    else res.destroy();
  });
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url ?? "/", "http://127.0.0.1");
  } catch {
    return sendJson(res, 400, { error: "Bad request" });
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (url.pathname === "/api/health") {
    return sendJson(res, 200, { status: "healthy", service: "lab-core", timestamp: new Date().toISOString() });
  }
  if (url.pathname === "/api/info") {
    return sendJson(res, 200, { service: "LAB CORE", version: "1.0.0", status: "online", labs: labs.length });
  }
  if (url.pathname === "/api/labs") {
    return sendJson(res, 200, { labs });
  }
  return sendFile(res, url.pathname);
});

server.listen(port, host, () => {
  console.log(`LAB CORE listening on http://${host}:${port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
