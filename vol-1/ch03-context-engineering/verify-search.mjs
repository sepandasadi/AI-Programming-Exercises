import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Run from relay/ after pnpm build.
const url = (path) => pathToFileURL(resolve(path)).href;
const { createApp } = await import(url("apps/api/dist/app.js"));
const { loadDocs } = await import(url("packages/core/dist/index.js"));
const sections = await loadDocs(resolve("fixtures/team-docs"));
const app = createApp({ sections });

const accepted = await app.request("/search?q=rollback&limit=2");
assert.equal(accepted.status, 200);
const headings = (await accepted.json()).results.map((row) => row.heading);
assert.deepEqual(headings, ["Incident rollback", "Rollback"]);
console.log(`${accepted.status} ${headings.join(" | ")}`);

const rejected = await app.request("/search?q=rollback&limit=2.0");
assert.equal(rejected.status, 400);
const { error } = await rejected.json();
assert.equal(error, "limit must be an integer written as digits");
console.log(`${rejected.status} ${error}`);
