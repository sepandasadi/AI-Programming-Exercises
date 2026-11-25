// spec: stale-issues
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  DEFAULT_ISSUES_FILE,
  loadIssues,
} from "./issues-file.js";

describe("loadIssues", () => {
  let dir = "";
  afterAll(() => rm(dir, { recursive: true, force: true }));

  it("loads the bundled fixture", async () => {
    const issues = await loadIssues(DEFAULT_ISSUES_FILE);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("AC-8: rejects an invalid file, naming it", async () => {
    dir = await mkdtemp(join(tmpdir(), "issues-"));
    const bad = join(dir, "issues.json");
    await writeFile(bad, '[{ "id": "x" }]');
    await expect(loadIssues(bad)).rejects.toThrow(bad);
  });

  it("AC-8: rejects a file that is not JSON", async () => {
    const bad = join(dir, "broken.json");
    await writeFile(bad, "{ not json");
    await expect(loadIssues(bad)).rejects.toThrow(bad);
  });
});
