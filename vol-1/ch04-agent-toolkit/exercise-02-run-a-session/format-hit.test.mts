import assert from "node:assert/strict";
import { test } from "node:test";
import { formatHit } from "./format-hit.mts";

test("uses the source line away from the top of the file", () => {
  assert.equal(
    formatHit({ heading: "Rollback", path: "docs/deploy.md", line: 27 }),
    "Rollback (docs/deploy.md:27)",
  );
});

test("keeps the heading, path and one-based first line", () => {
  assert.equal(
    formatHit({ heading: "On call", path: "docs/on-call.md", line: 1 }),
    "On call (docs/on-call.md:1)",
  );
});
