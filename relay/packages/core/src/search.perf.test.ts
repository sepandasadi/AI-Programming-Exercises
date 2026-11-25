import { describe, expect, it } from "vitest";
import type { DocSection } from "./search-types.js";
import { searchDocs } from "./search.js";

/** Mulberry32: a small seeded PRNG, so every run searches the same sections. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VOCABULARY = [
  "deploy", "rollback", "incident", "release", "service", "database", "migration",
  "alert", "pager", "runbook", "cluster", "config", "secret", "token", "cache",
  "queue", "worker", "latency", "error", "retry", "backup", "restore", "metric",
  "dashboard", "owner", "team", "review", "branch", "build", "test", "staging",
  "production", "canary", "feature", "flag", "schema", "index", "query", "timeout",
];

function generateSections(count: number, seed: number): DocSection[] {
  const random = seeded(seed);
  const word = () => VOCABULARY[Math.floor(random() * VOCABULARY.length)]!;
  const words = (n: number) => Array.from({ length: n }, word).join(" ");
  return Array.from({ length: count }, (_, i) => ({
    path: `docs/file-${Math.floor(i / 10)}.md`,
    heading: words(1 + Math.floor(random() * 4)),
    line: 1 + (i % 10) * 20,
    body: words(80 + Math.floor(random() * 120)),
  }));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

describe("searchDocs performance", () => {
  it("answers a 3-term query over 1,000 sections in under 50 ms (median of 10)", () => {
    const sections = generateSections(1000, 42);
    const query = "rollback incident database";

    searchDocs(sections, query, 20); // warm-up

    const timings: number[] = [];
    for (let run = 0; run < 10; run++) {
      const start = performance.now();
      const results = searchDocs(sections, query, 20);
      timings.push(performance.now() - start);
      expect(results.length).toBe(20);
    }
    const ms = median(timings);
    console.log(`searchDocs: median ${ms.toFixed(2)} ms over 1,000 sections`);
    expect(ms).toBeLessThan(50);
  });
});
