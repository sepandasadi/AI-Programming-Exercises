// spec: sla-table
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PRIORITIES } from "@relay/core";
import { createApp } from "./app.js";

const BodySchema = z.strictObject({
  priorities: z.array(
    z.strictObject({
      priority: z.enum(PRIORITIES),
      hours: z.number().int().positive(),
      clock: z.enum(["calendar", "business"]),
    }),
  ),
});

describe("GET /sla", () => {
  it("AC-1: returns 200 with one entry per priority, P0 to P3", async () => {
    const res = await createApp().request("/sla");
    expect(res.status).toBe(200);
    const body = BodySchema.parse(await res.json());
    expect(body.priorities.map((e) => e.priority)).toEqual([
      "P0",
      "P1",
      "P2",
      "P3",
    ]);
  });
});
