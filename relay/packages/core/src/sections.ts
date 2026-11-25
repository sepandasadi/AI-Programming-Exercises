import type { DocSection } from "./search-types.js";

/** An ATX heading of level 1–3: up to three spaces, 1–3 `#`, then a space, tab or end of line. */
const HEADING = /^ {0,3}#{1,3}(?:[ \t]+(.*))?$/;
/** An optional closing `#` sequence, which must follow a space or tab (or be the whole text). */
const CLOSING_HASHES = /(?:^|[ \t]+)#+[ \t]*$/;
/** An opening code fence: three or more backticks or tildes, indented up to three spaces. */
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const BLANK = /^\s*$/;

type Fence = { char: string; length: number };

type Draft = {
  heading: string;
  line: number;
  lines: string[];
};

/**
 * Splits one Markdown file into sections, one per level 1–3 ATX heading.
 * Text before the first heading becomes a section named after the file,
 * unless it is only whitespace. Lines inside fenced code blocks are never
 * headings. Pure: no I/O.
 */
export function parseSections(
  path: string,
  markdown: string,
): DocSection[] {
  const text = markdown.startsWith("﻿")
    ? markdown.slice(1)
    : markdown;
  const lines = text.split(/\r?\n/);

  const drafts: Draft[] = [
    { heading: fileName(path), line: 1, lines: [] },
  ];
  let fence: Fence | undefined;

  lines.forEach((line, index) => {
    const current = drafts[drafts.length - 1]!;

    if (fence) {
      if (closesFence(line, fence)) fence = undefined;
      current.lines.push(line);
      return;
    }

    const opened = openFence(line);
    if (opened) {
      fence = opened;
      current.lines.push(line);
      return;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      drafts.push({
        heading: headingText(heading[1] ?? ""),
        line: index + 1,
        lines: [],
      });
      return;
    }

    current.lines.push(line);
  });

  const [preamble, ...rest] = drafts;
  const sections = rest.map((d) => toSection(path, d));
  if (
    preamble &&
    preamble.lines.some((l) => !BLANK.test(l))
  ) {
    sections.unshift(toSection(path, preamble));
  }
  return sections;
}

function fileName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

function headingText(raw: string): string {
  return raw.replace(CLOSING_HASHES, "").trim();
}

function openFence(line: string): Fence | undefined {
  const match = FENCE_OPEN.exec(line);
  if (!match) return undefined;
  const marker = match[1] ?? "";
  const char = marker[0] ?? "`";
  // A backtick fence's info string may not contain backticks.
  if (char === "`" && (match[2] ?? "").includes("`"))
    return undefined;
  return { char, length: marker.length };
}

function closesFence(line: string, fence: Fence): boolean {
  const match = FENCE_CLOSE.exec(line);
  const marker = match?.[1];
  return (
    marker !== undefined &&
    marker[0] === fence.char &&
    marker.length >= fence.length
  );
}

/** D5: the body is the section's lines with leading and trailing blank lines trimmed. */
function toSection(path: string, draft: Draft): DocSection {
  let start = 0;
  let end = draft.lines.length;
  while (start < end && BLANK.test(draft.lines[start]!))
    start++;
  while (end > start && BLANK.test(draft.lines[end - 1]!))
    end--;
  return {
    path,
    heading: draft.heading,
    line: draft.line,
    body: draft.lines.slice(start, end).join("\n"),
  };
}
