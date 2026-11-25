// spec: issue-triage
import { describe, expect, it } from "vitest";
import {
  IssueSchema,
  MAX_LABELS,
  MAX_TITLE_LENGTH,
} from "./issue-schema.js";

const valid = {
  number: 412,
  title: "Checkout outage after deploy",
  body: "Payments return 502.",
  labels: ["bug"],
  created_at: "2026-11-27T16:30:00Z",
};

const parse = (over: Record<string, unknown> = {}) =>
  IssueSchema.safeParse({ ...valid, ...over });

const without = (field: keyof typeof valid) => {
  const { [field]: _, ...rest } = valid;
  return IssueSchema.safeParse(rest);
};

describe("IssueSchema", () => {
  it("AC-8: reads created_at with Z as that UTC instant", () => {
    const result = parse();
    expect(
      result.success && result.data.createdAt.toISOString(),
    ).toBe("2026-11-27T16:30:00.000Z");
  });

  it.each([
    [
      "2026-11-28T23:45:00+01:00",
      "2026-11-28T22:45:00.000Z",
    ],
    [
      "2026-11-27T11:30:00-05:00",
      "2026-11-27T16:30:00.000Z",
    ],
    [
      "2026-11-27T16:30:00+00:00",
      "2026-11-27T16:30:00.000Z",
    ],
    [
      "2026-11-27T16:30:00.250Z",
      "2026-11-27T16:30:00.250Z",
    ],
  ])(
    "AC-8: reads created_at %j as %s",
    (created_at, expected) => {
      const result = parse({ created_at });
      expect(
        result.success &&
          result.data.createdAt.toISOString(),
      ).toBe(expected);
    },
  );

  it("AC-9: labels given as strings are kept as strings", () => {
    const result = parse({
      labels: ["bug", "Priority:P1"],
    });
    expect(result.success && result.data.labels).toEqual([
      "bug",
      "Priority:P1",
    ]);
  });

  it("AC-9: labels given as objects become their names, mixed with strings", () => {
    const result = parse({
      labels: [
        {
          id: 7,
          name: "security",
          color: "d73a4a",
          default: false,
        },
        "bug",
      ],
    });
    expect(result.success && result.data.labels).toEqual([
      "security",
      "bug",
    ]);
  });

  it("AC-9: unknown top-level fields are ignored", () => {
    const result = parse({
      user: { login: "dana" },
      state: "open",
      html_url: "https://github.com/o/r/issues/412",
    });
    expect(result.success && result.data).toEqual({
      number: 412,
      title: "Checkout outage after deploy",
      body: "Payments return 502.",
      labels: ["bug"],
      createdAt: new Date("2026-11-27T16:30:00Z"),
    });
  });

  it.each([
    ["a string", "text", "text"],
    ["null", null, null],
  ])("AC-9: body may be %s", (_, body, expected) => {
    const result = parse({ body });
    expect(result.success && result.data.body).toBe(
      expected,
    );
  });

  it("AC-9: an absent body becomes null", () => {
    const result = without("body");
    expect(result.success && result.data.body).toBeNull();
  });

  it.each([
    "number",
    "title",
    "labels",
    "created_at",
  ] as const)("AC-10: rejects a missing %s", (field) => {
    expect(without(field).success).toBe(false);
  });

  it.each([
    ["number 0", { number: 0 }],
    ["number -1", { number: -1 }],
    ["number 1.5", { number: 1.5 }],
    ["number as a string", { number: "412" }],
    ["title not a string", { title: 42 }],
    ["body a number", { body: 5 }],
    ["labels not an array", { labels: "bug" }],
    ["a label that is a number", { labels: [3] }],
    [
      "a label object without name",
      { labels: [{ id: 1 }] },
    ],
    [
      "a label object with a non-string name",
      { labels: [{ name: null }] },
    ],
    [
      "created_at not a string",
      { created_at: 1764261000000 },
    ],
  ])("AC-10: rejects %s", (_, over) => {
    expect(parse(over).success).toBe(false);
  });

  it(`AC-10: accepts ${MAX_LABELS} labels and rejects ${MAX_LABELS + 1}`, () => {
    expect(MAX_LABELS).toBe(100);
    expect(
      parse({ labels: Array(MAX_LABELS).fill("x") })
        .success,
    ).toBe(true);
    expect(
      parse({ labels: Array(MAX_LABELS + 1).fill("x") })
        .success,
    ).toBe(false);
  });

  it.each([
    "2026-11-27T16:30:00",
    "2026-11-27T16:30:00.000",
    "2026-11-27",
    "2026-11-27T16:30:00+0100",
    "2026-11-27T16:30:00+01",
    "2026-11-27 16:30:00Z",
    "2026-02-30T10:00:00Z",
    "not a date",
    "",
  ])(
    "AC-10: rejects created_at %j (no offset or not a date-time)",
    (created_at) => {
      expect(parse({ created_at }).success).toBe(false);
    },
  );

  it.each(["", "   ", "\t\n"])(
    "AC-10: rejects blank title %j",
    (title) => {
      expect(parse({ title }).success).toBe(false);
    },
  );

  it(`AC-10: accepts a ${MAX_TITLE_LENGTH}-character title and rejects ${MAX_TITLE_LENGTH + 1}`, () => {
    expect(MAX_TITLE_LENGTH).toBe(256);
    expect(
      parse({ title: "a".repeat(MAX_TITLE_LENGTH) })
        .success,
    ).toBe(true);
    expect(
      parse({ title: "a".repeat(MAX_TITLE_LENGTH + 1) })
        .success,
    ).toBe(false);
  });

  it.each([[null], [[]], ["issue"], [412]])(
    "AC-10: rejects a non-object payload %j",
    (payload: unknown) => {
      expect(IssueSchema.safeParse(payload).success).toBe(
        false,
      );
    },
  );

  it("AC-10: every rejection carries a message naming the field", () => {
    const result = IssueSchema.safeParse({
      number: -1,
      title: " ",
      labels: [{}],
      created_at: "2026-11-27T16:30:00",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(
        (i) => i.message,
      );
      for (const field of [
        "number",
        "title",
        "labels",
        "created_at",
      ]) {
        expect(
          messages.some((m) => m.startsWith(field)),
        ).toBe(true);
      }
    }
  });
});
