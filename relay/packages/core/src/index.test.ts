import { describe, expect, it } from "vitest";
import { HealthSchema, RELAY_VERSION, health } from "./index.js";

describe("health", () => {
  it("returns a value that matches its schema", () => {
    const result = health();
    expect(HealthSchema.parse(result)).toEqual({
      status: "ok",
      version: RELAY_VERSION,
    });
  });
});
