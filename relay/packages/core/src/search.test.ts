import { describe, expect, it } from "vitest";
import type { DocSection } from "./search-types.js";
import { SearchResultSchema } from "./search-types.js";
import { searchDocs } from "./search.js";

const section = (
  path: string,
  heading: string,
  body: string,
  line = 1,
): DocSection => ({ path, heading, line, body });

describe("searchDocs", () => {
  it("AC-1: matching is case-insensitive in the query, heading and body", () => {
    const sections = [
      section(
        "a.md",
        "Deploying",
        "Use the ROLLBACK script.",
      ),
      section("b.md", "rollback", "Nothing else here."),
      section("c.md", "Onboarding", "Read the handbook."),
    ];
    const results = searchDocs(sections, "RollBack", 20);
    expect(results.map((r) => r.path).sort()).toEqual([
      "a.md",
      "b.md",
    ]);
  });

  it("AC-1: returns every matching section when limit is large enough", () => {
    const sections = Array.from({ length: 12 }, (_, i) =>
      section(
        `doc-${String(i).padStart(2, "0")}.md`,
        `Section ${i}`,
        i % 3 === 0 ? "deploy now" : "other text",
      ),
    );
    const results = searchDocs(sections, "deploy", 20);
    expect(results.map((r) => r.path)).toEqual([
      "doc-00.md",
      "doc-03.md",
      "doc-06.md",
      "doc-09.md",
    ]);
  });

  it("AC-1: a section matches on any one query term, by whole term only", () => {
    const sections = [
      section(
        "a.md",
        "Rollbacks",
        "Many rollbacks happened.",
      ),
      section("b.md", "Deploy", "Ship it."),
    ];
    // "rollback" does not match "rollbacks"; "deploy" matches b.md.
    const results = searchDocs(
      sections,
      "rollback deploy",
      20,
    );
    expect(results.map((r) => r.path)).toEqual(["b.md"]);
  });

  it("AC-2: a heading hit scores higher than the same term only in the body", () => {
    const sections = [
      section(
        "a.md",
        "Notes",
        "How to rollback a release.",
      ),
      section("b.md", "Rollback", "How to undo a release."),
    ];
    const [first, second] = searchDocs(
      sections,
      "rollback",
      5,
    );
    expect(first).toMatchObject({ path: "b.md", score: 3 });
    expect(second).toMatchObject({
      path: "a.md",
      score: 1,
    });
  });

  it("AC-2: score is 3 x heading occurrences + body occurrences, summed over terms", () => {
    // Heading: "rollback" once (3). Body: "rollback" twice, "deploy" twice (4). Total 7.
    const sections = [
      section(
        "a.md",
        "Rollback plan",
        "Rollback after a bad deploy. If the deploy fails, rollback again.",
      ),
    ];
    const [result] = searchDocs(
      sections,
      "rollback deploy",
      5,
    );
    expect(result?.score).toBe(7);
  });

  it("AC-2: a repeated query term counts once", () => {
    const sections = [
      section("a.md", "Rollback", "rollback"),
    ];
    expect(
      searchDocs(
        sections,
        "rollback ROLLBACK rollback",
        5,
      )[0]?.score,
    ).toBe(4);
  });

  it("AC-5: results are ordered by score descending", () => {
    const sections = [
      section("a.md", "Notes", "deploy"),
      section("b.md", "Deploy", "deploy deploy"),
      section("c.md", "Deploy", ""),
    ];
    expect(
      searchDocs(sections, "deploy", 5).map((r) => [
        r.path,
        r.score,
      ]),
    ).toEqual([
      ["b.md", 5],
      ["c.md", 3],
      ["a.md", 1],
    ]);
  });

  it("AC-5: ties sort by path ascending, then line ascending", () => {
    const sections = [
      section("z/last.md", "Deploy", "", 1),
      section("b.md", "Deploy", "", 30),
      section("a/nested.md", "Deploy", "", 4),
      section("b.md", "Deploy", "", 2),
      section("a.md", "Deploy", "", 9),
    ];
    expect(
      searchDocs(sections, "deploy", 10).map(
        (r) => `${r.path}:${r.line}`,
      ),
    ).toEqual([
      "a.md:9",
      "a/nested.md:4",
      "b.md:2",
      "b.md:30",
      "z/last.md:1",
    ]);
  });

  it("AC-5: limit keeps the top results after sorting", () => {
    const sections = [
      section("a.md", "Notes", "deploy"),
      section("b.md", "Deploy", "deploy"),
      section("c.md", "Deploy", ""),
    ];
    expect(
      searchDocs(sections, "deploy", 2).map((r) => r.path),
    ).toEqual(["b.md", "c.md"]);
  });

  it("AC-8 (core): a query with no matches returns []", () => {
    const sections = [
      section("a.md", "Deploy", "Ship it."),
    ];
    expect(searchDocs(sections, "kubernetes", 5)).toEqual(
      [],
    );
    expect(searchDocs([], "deploy", 5)).toEqual([]);
  });

  it("AC-8 (core): a query of only 1-character terms returns []", () => {
    const sections = [
      section("a.md", "A b c", "a b c d e"),
    ];
    expect(searchDocs(sections, "a b c", 5)).toEqual([]);
    expect(searchDocs(sections, " - ! ", 5)).toEqual([]);
  });

  it("AC-3 (core): each result parses with SearchResultSchema", () => {
    const long = Array.from(
      { length: 100 },
      (_, i) => `word${i}`,
    ).join(" ");
    const sections = [
      section(
        "runbooks/on-call.md",
        "Incident rollback",
        `${long} rollback ${long}`,
        12,
      ),
      section(
        "deploying.md",
        "Rollback",
        "Run the script.",
        3,
      ),
    ];
    const results = searchDocs(sections, "rollback", 5);
    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(SearchResultSchema.parse(result)).toEqual(
        result,
      );
      expect(Object.keys(result).sort()).toEqual([
        "heading",
        "line",
        "path",
        "score",
        "snippet",
      ]);
    }
    expect(results[0]).toMatchObject({
      path: "runbooks/on-call.md",
      heading: "Incident rollback",
      line: 12,
    });
    expect(results[0]?.snippet).toContain("rollback");
  });

  it("AC-4: the snippet comes from the section body", () => {
    const sections = [
      section("a.md", "Rollback", "Run   the\n\nscript."),
    ];
    expect(
      searchDocs(sections, "rollback", 5)[0]?.snippet,
    ).toBe("Run the script.");
  });

  it("rejects a limit that is not a positive integer", () => {
    const sections = [section("a.md", "Deploy", "")];
    for (const limit of [0, -1, 2.5, Number.NaN]) {
      expect(() =>
        searchDocs(sections, "deploy", limit),
      ).toThrow(RangeError);
    }
  });
});
