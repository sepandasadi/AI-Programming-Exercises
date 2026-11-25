// spec: docs-search
import { describe, expect, it } from "vitest";
import { queryTerms, tokenize } from "./terms.js";

const terms = (text: string) =>
  tokenize(text).map((t) => t.term);

describe("tokenize", () => {
  it("AC-1: lowercases terms so matching is case-insensitive", () => {
    expect(terms("Rollback ROLLBACK rollBack")).toEqual([
      "rollback",
      "rollback",
      "rollback",
    ]);
  });

  it("AC-1: matches whole terms only (rollback is not rollbacks)", () => {
    const found = terms("Two rollbacks, one rollback.");
    expect(found).toContain("rollbacks");
    expect(
      found.filter((t) => t === "rollback"),
    ).toHaveLength(1);
  });

  it("drops terms shorter than two characters", () => {
    expect(terms("a b cd 1 22 x")).toEqual(["cd", "22"]);
  });

  it("splits on punctuation: relay-ops gives relay and ops", () => {
    expect(terms("relay-ops")).toEqual(["relay", "ops"]);
    expect(terms("v1.2_beta/ops")).toEqual([
      "v1",
      "beta",
      "ops",
    ]);
  });

  it("keeps letters and digits together in one term", () => {
    expect(terms("node22 and ES2023")).toEqual([
      "node22",
      "and",
      "es2023",
    ]);
  });

  it("returns no terms for empty or punctuation-only text", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("  --- ... !!")).toEqual([]);
  });

  it("gives offsets into the original text, including non-ASCII", () => {
    const text = "Déploiement — café über Größe";
    const tokens = tokenize(text);
    expect(tokens.map((t) => t.term)).toEqual([
      "déploiement",
      "café",
      "über",
      "größe",
    ]);
    for (const t of tokens) {
      expect(text.slice(t.start, t.end).toLowerCase()).toBe(
        t.term,
      );
    }
    expect(tokens[1]).toEqual({
      term: "café",
      start: 14,
      end: 18,
    });
  });

  it("treats non-Latin letters as letters", () => {
    expect(terms("部署 откат")).toEqual(["部署", "откат"]);
  });
});

describe("queryTerms", () => {
  it("AC-1: lowercases query terms", () => {
    expect(queryTerms("Incident ROLLBACK")).toEqual([
      "incident",
      "rollback",
    ]);
  });

  it("deduplicates repeated terms, keeping first-seen order", () => {
    expect(
      queryTerms(
        "rollback deploy Rollback ROLLBACK deploy",
      ),
    ).toEqual(["rollback", "deploy"]);
  });

  it("drops one-character terms", () => {
    expect(queryTerms("a b c")).toEqual([]);
    expect(queryTerms("a rollback")).toEqual(["rollback"]);
  });

  it("splits punctuation in queries the same way as text", () => {
    expect(queryTerms("relay-ops")).toEqual([
      "relay",
      "ops",
    ]);
  });
});
