import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadDocs } from "@relay/core";
import { resolveDocsRoot } from "./config.js";

// Spec, Interface: "The API reads the docs root from RELAY_DOCS_DIR
// (default: fixtures/team-docs)." No AC covers this, so the tests are
// named after the Interface requirement.
describe("resolveDocsRoot", () => {
  it("Interface: defaults to relay/fixtures/team-docs, independent of the working directory", async () => {
    const fromApi = resolveDocsRoot({}, "/somewhere/else");
    const fromRoot = resolveDocsRoot({}, process.cwd());
    expect(fromApi).toBe(fromRoot);
    expect(fromApi.split(/[\\/]/).slice(-2)).toEqual([
      "fixtures",
      "team-docs",
    ]);
    expect(existsSync(fromApi)).toBe(true);
    const sections = await loadDocs(fromApi);
    expect(
      sections.some((s) => s.path === "deploying.md"),
    ).toBe(true);
  });

  it("Interface: a blank RELAY_DOCS_DIR falls back to the default", () => {
    const fallback = resolveDocsRoot({});
    expect(resolveDocsRoot({ RELAY_DOCS_DIR: "" })).toBe(
      fallback,
    );
    expect(resolveDocsRoot({ RELAY_DOCS_DIR: "   " })).toBe(
      fallback,
    );
  });

  it("Interface: a relative RELAY_DOCS_DIR resolves against the working directory", () => {
    const cwd = resolve("/tmp/relay-cwd");
    expect(
      resolveDocsRoot({ RELAY_DOCS_DIR: "my-docs" }, cwd),
    ).toBe(join(cwd, "my-docs"));
    expect(
      resolveDocsRoot(
        { RELAY_DOCS_DIR: "../shared/docs" },
        cwd,
      ),
    ).toBe(resolve(cwd, "../shared/docs"));
  });

  it("Interface: an absolute RELAY_DOCS_DIR is used as given", () => {
    const abs = resolve("/srv/team-docs");
    expect(
      resolveDocsRoot({ RELAY_DOCS_DIR: abs }, "/anywhere"),
    ).toBe(abs);
  });
});
