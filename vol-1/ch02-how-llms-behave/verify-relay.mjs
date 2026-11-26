import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Run from the built Relay checkout at v1-ch07.
const url = pathToFileURL(resolve("apps/api/dist/app.js"));
const { createApp } = await import(url.href);
const body = await readFile("fixtures/issues/friday-outage.json", "utf8");
const response = await createApp().request("/triage", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body,
});
assert.equal(response.status, 200);
const result = await response.json();
assert.equal(result.priority, "P1");
assert.equal(result.reason, "title term outage");
assert.equal(result.respondBy, "2026-11-30T12:30:00.000Z");
console.log(`${result.priority} | ${result.reason}`);
console.log(result.respondBy);
