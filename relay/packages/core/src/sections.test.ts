import { describe, expect, it } from "vitest";
import { parseSections } from "./sections.js";

const md = (...lines: string[]) => lines.join("\n");

describe("parseSections", () => {
  it("AC-3: gives each section its heading text and the 1-based line of the heading", () => {
    const sections = parseSections(
      "deploying.md",
      md(
        "# Deploying",
        "",
        "Intro text.",
        "",
        "## Rollback",
        "Run the rollback.",
        "### Details",
        "More.",
      ),
    );
    expect(sections).toEqual([
      { path: "deploying.md", heading: "Deploying", line: 1, body: "Intro text." },
      { path: "deploying.md", heading: "Rollback", line: 5, body: "Run the rollback." },
      { path: "deploying.md", heading: "Details", line: 7, body: "More." },
    ]);
  });

  it("AC-3: keeps the path it is given, forward slashes included", () => {
    const [section] = parseSections("runbooks/on-call.md", "# On-Call\nText");
    expect(section?.path).toBe("runbooks/on-call.md");
  });

  it("treats levels 1-3 as headings, but not #### or #tag", () => {
    const sections = parseSections(
      "a.md",
      md("# One", "## Two", "### Three", "#### Four", "#tag", "####### Seven"),
    );
    expect(sections.map((s) => s.heading)).toEqual(["One", "Two", "Three"]);
    expect(sections[2]?.body).toBe(md("#### Four", "#tag", "####### Seven"));
  });

  it("strips an optional closing # sequence and surrounding spaces from a heading", () => {
    const sections = parseSections("a.md", md("##   Rollback ##  ", "body"));
    expect(sections[0]?.heading).toBe("Rollback");
  });

  it("keeps a fenced # comment in the body", () => {
    const sections = parseSections(
      "a.md",
      md(
        "# Script",
        "```sh",
        "# comment, not a heading",
        "echo hi",
        "```",
        "~~~",
        "## also not a heading",
        "~~~",
        "## Next",
        "after",
      ),
    );
    expect(sections.map((s) => [s.heading, s.line])).toEqual([
      ["Script", 1],
      ["Next", 9],
    ]);
    expect(sections[0]?.body).toContain("# comment, not a heading");
    expect(sections[0]?.body).toContain("## also not a heading");
  });

  it("does not close a fence on a shorter or different fence marker", () => {
    const sections = parseSections(
      "a.md",
      md("# A", "````", "```", "# inside", "~~~", "````", "# B"),
    );
    expect(sections.map((s) => s.heading)).toEqual(["A", "B"]);
    expect(sections[0]?.body).toContain("# inside");
  });

  it("handles CRLF line endings and a leading BOM", () => {
    const sections = parseSections(
      "a.md",
      "﻿# Title\r\n\r\nLine one\r\nLine two\r\n## Next\r\nx\r\n",
    );
    expect(sections).toEqual([
      { path: "a.md", heading: "Title", line: 1, body: "Line one\nLine two" },
      { path: "a.md", heading: "Next", line: 5, body: "x" },
    ]);
  });

  it("puts text before the first heading in a section named after the file", () => {
    const sections = parseSections(
      "runbooks/on-call.md",
      md("Read this first.", "", "# On-Call", "Paging."),
    );
    expect(sections[0]).toEqual({
      path: "runbooks/on-call.md",
      heading: "on-call.md",
      line: 1,
      body: "Read this first.",
    });
    expect(sections[1]?.heading).toBe("On-Call");
  });

  it("drops a whitespace-only preamble", () => {
    const sections = parseSections("a.md", md("", "   ", "\t", "# Title", "x"));
    expect(sections).toEqual([{ path: "a.md", heading: "Title", line: 4, body: "x" }]);
  });

  it("returns no sections for an empty or whitespace-only file", () => {
    expect(parseSections("a.md", "")).toEqual([]);
    expect(parseSections("a.md", " \n\n\t\n")).toEqual([]);
  });

  it("trims leading and trailing blank lines from the body but keeps inner ones (D5)", () => {
    const sections = parseSections(
      "a.md",
      md("# Title", "", "  ", "  indented first", "", "last  ", "", "", "## Empty", "", "# End"),
    );
    expect(sections[0]?.body).toBe(md("  indented first", "", "last  "));
    expect(sections[1]).toMatchObject({ heading: "Empty", body: "" });
    expect(sections[2]).toMatchObject({ heading: "End", line: 11, body: "" });
  });
});
