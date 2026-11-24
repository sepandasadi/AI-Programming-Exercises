import { describe, expect, it } from "vitest";
import { HealthSchema } from "@relay/core";
import { createApp } from "./app.js";

describe("GET /health", () => {
  it("responds 200 with a valid health body", async () => {
    const res = await createApp().request("/health");
    expect(res.status).toBe(200);
    expect(HealthSchema.safeParse(await res.json()).success).toBe(true);
  });
});
