import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 3317;
const child = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });

try {
  await new Promise(resolve => setTimeout(resolve, 250));
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
  const missing = await fetch(`http://127.0.0.1:${port}/does-not-exist`);
  assert.equal(missing.status, 404);
  console.log("LAB CORE API tests passed.");
} finally {
  child.kill();
}
