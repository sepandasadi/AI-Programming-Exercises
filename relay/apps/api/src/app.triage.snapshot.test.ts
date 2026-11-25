// spec: issue-triage
import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const dir = new URL(
  "../../../fixtures/issues/",
  import.meta.url,
);

describe("POST /triage on the sample issues", () => {
  it("AC-8, AC-9: matches the reviewed output", async () => {
    const app = createApp();
    const out: Record<string, unknown> = {};
    for (const name of (await readdir(dir)).sort()) {
      const body = await readFile(
        new URL(name, dir),
        "utf8",
      );
      const res = await app.request("/triage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });
      out[name] = await res.json();
    }
    expect(out).toMatchInlineSnapshot(`
      {
        "feature-request.json": {
          "number": 414,
          "priority": "P3",
          "reason": "default",
          "respondBy": "2026-12-04T17:00:00.000Z",
        },
        "friday-outage.json": {
          "number": 412,
          "priority": "P1",
          "reason": "title term outage",
          "respondBy": "2026-11-30T12:30:00.000Z",
        },
        "weekend-p0.json": {
          "number": 413,
          "priority": "P0",
          "reason": "label priority:p0",
          "respondBy": "2026-11-28T23:45:00.000Z",
        },
      }
    `);
  });
});
