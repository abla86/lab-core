import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const port = 33000 + (process.pid % 1000);
const child = spawn(process.execPath, ["server.js"], { cwd: fileURLToPath(new URL("..", import.meta.url)), env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
child.on("error", error => { throw error; });
await new Promise((resolve, reject) => { child.once("spawn", resolve); child.once("error", reject); });

try {
  for (let attempt = 0; attempt < 20; attempt++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
    if (attempt === 19) throw new Error("Server did not become ready");
  }
  for (const [path, check] of [
    ["/api/health", body => assert.equal(body.status, "healthy")],
    ["/api/info", body => assert.equal(body.labs, 6)],
    ["/api/labs", body => assert.equal(body.labs.length, 6)]
  ]) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    check(await response.json());
  }
  const page = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /LAB CORE/);
  assert.equal(page.headers.get("x-content-type-options"), "nosniff");
  assert.match(page.headers.get("content-security-policy"), /script-src 'self'/);

  for (const asset of ["/css/lab-core.css", "/js/lab-core.js"]) {
    const response = await fetch(`http://127.0.0.1:${port}${asset}`);
    assert.equal(response.status, 200);
  }

  const traversal = await fetch(`http://127.0.0.1:${port}/%2e%2e/server.js`);
  assert.equal(traversal.status, 404);
  const missing = await fetch(`http://127.0.0.1:${port}/does-not-exist`);
  assert.equal(missing.status, 404);
  const method = await fetch(`http://127.0.0.1:${port}/api/health`, { method: "POST" });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("allow"), "GET");
  assert.equal(method.headers.get("x-content-type-options"), "nosniff");
  assert.equal(method.headers.get("cache-control"), "no-store");
  console.log("LAB CORE API tests passed.");
} finally {
  if (!child.killed) child.kill("SIGTERM");
  await new Promise(resolve => child.once("exit", resolve));
}
