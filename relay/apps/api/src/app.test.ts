import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  type DocSection,
  HealthSchema,
  SearchResultSchema,
} from "@relay/core";
import { createApp } from "./app.js";

describe("GET /health", () => {
  it("responds 200 with a valid health body", async () => {
    const res = await createApp({ sections: [] }).request(
      "/health",
    );
    expect(res.status).toBe(200);
    expect(
      HealthSchema.safeParse(await res.json()).success,
    ).toBe(true);
  });
});

const ErrorBodySchema = z.object({
  error: z.string().min(1),
});
const OkBodySchema = z.object({
  query: z.string(),
  results: z.array(z.unknown()),
});

/** 25 sections that all match "deploy", so the limit decides the count. */
const sections: DocSection[] = Array.from(
  { length: 25 },
  (_, i) => ({
    path: `docs/doc-${String(i).padStart(2, "0")}.md`,
    heading: i % 2 === 0 ? "Deploy" : `Section ${i}`,
    line: i + 1,
    body: "How to deploy the service, then verify the deploy.",
  }),
);

const app = createApp({ sections });
const get = (query: string) =>
  app.request(`/search${query}`);

async function expectError(query: string) {
  const res = await get(query);
  expect(res.status).toBe(400);
  expect(
    ErrorBodySchema.safeParse(await res.json()).success,
  ).toBe(true);
}

async function okBody(query: string) {
  const res = await get(query);
  expect(res.status).toBe(200);
  return OkBodySchema.parse(await res.json());
}

describe("GET /search", () => {
  it("AC-6: limit defaults to 5", async () => {
    const body = await okBody("?q=deploy");
    expect(body.results).toHaveLength(5);
  });

  it.each(["0", "21", "2.5", "abc", "", "1e1"])(
    "AC-6: limit=%j returns 400",
    async (limit) => {
      await expectError(
        `?q=deploy&limit=${encodeURIComponent(limit)}`,
      );
    },
  );

  it.each([1, 20])(
    "AC-6: limit=%d returns 200 with that many results",
    async (limit) => {
      const body = await okBody(`?q=deploy&limit=${limit}`);
      expect(body.results).toHaveLength(limit);
    },
  );

  it("AC-7: a missing q returns 400 with { error: string }", async () => {
    await expectError("");
    await expectError("?limit=3");
  });

  it.each(["", "%20%20", "%09"])(
    "AC-7: a blank q (%j) returns 400 with { error: string }",
    async (q) => {
      await expectError(`?q=${q}`);
    },
  );

  it("AC-7: a 201-character q returns 400 with { error: string }", async () => {
    await expectError(`?q=${"a".repeat(201)}`);
  });

  it("AC-7: a 200-character q returns 200", async () => {
    await okBody(`?q=${"a".repeat(200)}`);
  });

  it("AC-8: a query with no matches returns 200 with results: []", async () => {
    const body = await okBody("?q=kubernetes");
    expect(body).toEqual({
      query: "kubernetes",
      results: [],
    });
  });

  it("AC-3: every result parses with SearchResultSchema", async () => {
    const body = await okBody("?q=deploy&limit=20");
    expect(body.query).toBe("deploy");
    expect(body.results.length).toBeGreaterThan(0);
    for (const result of body.results) {
      expect(
        SearchResultSchema.safeParse(result).success,
      ).toBe(true);
    }
  });
});
