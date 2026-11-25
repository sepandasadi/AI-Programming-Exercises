import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIMIT,
  SearchParamsSchema,
} from "./search-schema.js";

const parse = (input: Record<string, unknown>) =>
  SearchParamsSchema.safeParse(input);

describe("SearchParamsSchema", () => {
  it("AC-6: limit defaults to 5", () => {
    const result = parse({ q: "rollback" });
    expect(DEFAULT_LIMIT).toBe(5);
    expect(result.success && result.data).toEqual({
      q: "rollback",
      limit: 5,
    });
  });

  it.each([
    "0",
    "21",
    "2.5",
    "abc",
    "",
    "1e1",
    "2.0",
    "-1",
    " 3",
    "+3",
  ])("AC-6: rejects limit %j", (limit) => {
    expect(parse({ q: "rollback", limit }).success).toBe(
      false,
    );
  });

  it.each([
    ["1", 1],
    ["20", 20],
    ["07", 7],
  ])("AC-6: accepts limit %j as %d", (limit, expected) => {
    const result = parse({ q: "rollback", limit });
    expect(result.success && result.data.limit).toBe(
      expected,
    );
  });

  it("AC-7: rejects a missing q", () => {
    expect(parse({}).success).toBe(false);
  });

  it.each(["", "   ", "\t\n"])(
    "AC-7: rejects blank q %j",
    (q) => {
      expect(parse({ q }).success).toBe(false);
    },
  );

  it("AC-7: accepts a 200-character q and rejects a 201-character q", () => {
    expect(parse({ q: "a".repeat(200) }).success).toBe(
      true,
    );
    expect(parse({ q: "a".repeat(201) }).success).toBe(
      false,
    );
  });

  it("AC-7: every rejection carries a non-empty message", () => {
    const result = parse({ q: " ", limit: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      for (const issue of result.error.issues)
        expect(issue.message.length).toBeGreaterThan(0);
    }
  });
});
