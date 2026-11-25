import { describe, expect, it } from "vitest";
import { makeSnippet, SNIPPET_LENGTH } from "./snippet.js";

const filler = (words: number) =>
  Array.from({ length: words }, (_, i) => `word${i}`).join(
    " ",
  );

describe("makeSnippet", () => {
  it("AC-4: a snippet is never longer than 160 characters", () => {
    expect(SNIPPET_LENGTH).toBe(160);
    const body = `${filler(200)} rollback ${filler(200)}`;
    expect(
      makeSnippet(body, ["rollback"]).length,
    ).toBeLessThanOrEqual(160);
    expect(
      makeSnippet(body, ["nomatch"]).length,
    ).toBeLessThanOrEqual(160);
    expect(
      makeSnippet("x".repeat(500), ["xx"]).length,
    ).toBeLessThanOrEqual(160);
  });

  it("AC-4: collapses whitespace to single spaces and trims", () => {
    const body =
      "  First line.\n\n\tSecond   line\r\n  third.  ";
    expect(makeSnippet(body, ["second"])).toBe(
      "First line. Second line third.",
    );
  });

  it("AC-4: a term late in a long body still appears in the snippet", () => {
    const body = `${filler(300)} Run the rollback script now.`;
    const snippet = makeSnippet(body, ["rollback"]);
    expect(snippet).toContain("rollback");
    expect(snippet.length).toBeLessThanOrEqual(160);
    expect(snippet.startsWith("word0 ")).toBe(false);
  });

  it("AC-4: starts about 40 characters before the matching term", () => {
    const body = `${filler(100)} rollback ${filler(100)}`;
    const snippet = makeSnippet(body, ["rollback"]);
    const at = snippet.indexOf("rollback");
    expect(at).toBeGreaterThanOrEqual(35);
    expect(at).toBeLessThanOrEqual(40);
    // Edge whitespace is trimmed, so the window may lose a character.
    expect(snippet.length).toBeGreaterThanOrEqual(158);
  });

  it("AC-4: when several terms match, the earliest in the body wins", () => {
    const body = `${filler(60)} deploy ${filler(60)} rollback ${filler(60)}`;
    // Query order does not matter: "deploy" comes first in the body.
    const snippet = makeSnippet(body, [
      "rollback",
      "deploy",
    ]);
    expect(snippet).toContain("deploy");
    expect(snippet).not.toContain("rollback");
  });

  it("AC-4: matches whole terms, case-insensitively", () => {
    const body = `rollbacks ${filler(60)} ROLLBACK ${filler(60)}`;
    const snippet = makeSnippet(body, ["rollback"]);
    expect(snippet).toContain("ROLLBACK");
    expect(snippet.startsWith("rollbacks")).toBe(false);
  });

  it("AC-4: with no match, the snippet is the first 160 characters", () => {
    const body = filler(200);
    expect(makeSnippet(body, ["rollback"])).toBe(
      body.slice(0, 160).trim(),
    );
    expect(makeSnippet(body, [])).toBe(
      body.slice(0, 160).trim(),
    );
  });

  it("AC-4: a match near the end fills the window from earlier text", () => {
    const body = `${filler(100)} rollback`;
    const snippet = makeSnippet(body, ["rollback"]);
    expect(snippet.endsWith("rollback")).toBe(true);
    expect(snippet.length).toBeGreaterThanOrEqual(158);
  });

  it("AC-4: a short body is returned whole", () => {
    expect(
      makeSnippet("Roll back with relay-ops.", ["ops"]),
    ).toBe("Roll back with relay-ops.");
  });

  it("AC-4: an empty or whitespace-only body gives an empty snippet", () => {
    expect(makeSnippet("", ["rollback"])).toBe("");
    expect(makeSnippet(" \n\t ", ["rollback"])).toBe("");
  });

  it("AC-4: adds no ellipsis", () => {
    const body = `${filler(100)} rollback ${filler(100)}`;
    expect(makeSnippet(body, ["rollback"])).not.toMatch(
      /…|\.\.\./,
    );
  });

  it("does not split a surrogate pair at the window edges", () => {
    // "a" shifts the emoji so offset 160 falls inside a pair.
    const body = `a${"😀".repeat(200)}`;
    const snippet = makeSnippet(body, []);
    expect(snippet.length).toBeLessThanOrEqual(160);
    expect(snippet).toBe(`a${"😀".repeat(79)}`);
  });
});
