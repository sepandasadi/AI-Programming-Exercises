// spec: issue-triage
// POST /triage lives in app.ts. Its tests sit in their own file so that
// spec:check does not count app.test.ts's docs-search titles (AC-3, AC-6,
// AC-7, AC-8 of that spec) as issue-triage coverage.
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PRIORITIES } from "@relay/core";
import { createApp } from "./app.js";

const ErrorBodySchema = z.strictObject({
  error: z.string().min(1),
});
const OkBodySchema = z.strictObject({
  number: z.number(),
  priority: z.enum(PRIORITIES),
  reason: z.string(),
  respondBy: z.string(),
});

const app = createApp();

const post = (
  body: string,
  contentType = "application/json",
) =>
  app.request("/triage", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  });

const fixture = (name: string) =>
  readFile(
    new URL(
      `../../../fixtures/issues/${name}.json`,
      import.meta.url,
    ),
    "utf8",
  );

const valid = {
  number: 1,
  title: "Search is slow",
  body: null,
  labels: [],
  created_at: "2026-11-23T09:00:00Z",
};

async function ok(body: string) {
  const res = await post(body);
  expect(res.status).toBe(200);
  return OkBodySchema.parse(await res.json());
}

async function expectError(body: string) {
  const res = await post(body);
  expect(res.status).toBe(400);
  return ErrorBodySchema.parse(await res.json());
}

const withField = (over: Record<string, unknown>) =>
  JSON.stringify({ ...valid, ...over });

const tooManyLabels = Array.from(
  { length: 101 },
  () => "bug",
);

describe("POST /triage", () => {
  it("AC-8: friday-outage.json returns P1, title term outage, respond-by Monday 12:30 UTC", async () => {
    expect(
      await ok(await fixture("friday-outage")),
    ).toEqual({
      number: 412,
      priority: "P1",
      reason: "title term outage",
      respondBy: "2026-11-30T12:30:00.000Z",
    });
  });

  it("AC-8: a created_at with a +01:00 offset is read as UTC (weekend-p0.json)", async () => {
    // 2026-11-28T23:45:00+01:00 is 22:45 UTC; P0 adds 60 calendar minutes.
    expect(await ok(await fixture("weekend-p0"))).toEqual({
      number: 413,
      priority: "P0",
      reason: "label priority:p0",
      respondBy: "2026-11-28T23:45:00.000Z",
    });
  });

  it("AC-8: respondBy is in Date.toISOString() form", async () => {
    const body = await ok(
      withField({
        labels: ["security"],
        created_at: "2026-11-27T04:00:00-05:00",
      }),
    );
    // 09:00 UTC Friday plus 4 business hours.
    expect(body.respondBy).toBe("2026-11-27T13:00:00.000Z");
    expect(new Date(body.respondBy).toISOString()).toBe(
      body.respondBy,
    );
  });

  it("AC-9: string labels work (feature-request.json)", async () => {
    // Created Monday 08:15 UTC: the clock starts at 09:00, and 40 business
    // hours end at Friday's close.
    expect(
      await ok(await fixture("feature-request")),
    ).toEqual({
      number: 414,
      priority: "P3",
      reason: "default",
      respondBy: "2026-12-04T17:00:00.000Z",
    });
  });

  it("AC-9: GitHub label objects and unknown fields are accepted", async () => {
    const body = await ok(
      withField({
        labels: [{ id: 9, name: " BUG ", color: "d73a4a" }],
        user: { login: "dana" },
        state: "open",
        reactions: { total_count: 3 },
      }),
    );
    expect(body.priority).toBe("P2");
    expect(body.reason).toBe("label bug");
  });

  it("AC-9: an absent body is accepted", async () => {
    const { body: _, ...rest } = valid;
    await ok(JSON.stringify(rest));
  });

  it.each([
    "",
    "{",
    "{'number': 1}",
    "not json",
    '{"number": 1,}',
  ])(
    "AC-10: malformed JSON %j returns 400 with { error: string }",
    async (raw) => {
      await expectError(raw);
    },
  );

  it.each(["null", "[]", '"issue"', "42"])(
    "AC-10: a JSON %s that is not an object returns 400",
    async (raw) => {
      await expectError(raw);
    },
  );

  it.each(["number", "title", "labels", "created_at"])(
    "AC-10: a missing %s returns 400 with { error: string }",
    async (field) => {
      const rest: Record<string, unknown> = { ...valid };
      delete rest[field];
      const { error } = await expectError(
        JSON.stringify(rest),
      );
      expect(error).toContain(field);
    },
  );

  it.each([
    ["number 0", { number: 0 }],
    ["number 2.5", { number: 2.5 }],
    ["labels as a string", { labels: "bug" }],
    [
      "a label object without name",
      { labels: [{ id: 1 }] },
    ],
    ["101 labels", { labels: tooManyLabels }],
    ["body a number", { body: 7 }],
  ])(
    "AC-10: an invalid field (%s) returns 400",
    async (_, over) => {
      await expectError(withField(over));
    },
  );

  it.each([
    "2026-11-27T16:30:00",
    "2026-11-27",
    "2026-11-27T16:30:00+0100",
  ])(
    "AC-10: created_at %j without a valid offset returns 400",
    async (created_at) => {
      const { error } = await expectError(
        withField({ created_at }),
      );
      expect(error).toContain("created_at");
    },
  );

  it.each(["", "   "])(
    "AC-10: a blank title %j returns 400",
    async (title) => {
      const { error } = await expectError(
        withField({ title }),
      );
      expect(error).toContain("title");
    },
  );

  it("AC-10: a 257-character title returns 400 and a 256-character one returns 200", async () => {
    await expectError(
      withField({ title: "a".repeat(257) }),
    );
    await ok(withField({ title: "a".repeat(256) }));
  });
});
