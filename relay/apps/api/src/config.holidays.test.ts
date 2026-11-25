// spec: triage-holidays
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { resolveHolidays } from "./config.js";

const run = promisify(execFile);
const apiDir = fileURLToPath(
  new URL("..", import.meta.url),
);

describe("resolveHolidays", () => {
  it("AC-6: unset or blank RELAY_HOLIDAYS is no holidays", () => {
    expect(resolveHolidays({})).toEqual([]);
    expect(resolveHolidays({ RELAY_HOLIDAYS: "" })).toEqual(
      [],
    );
    expect(
      resolveHolidays({ RELAY_HOLIDAYS: "  " }),
    ).toEqual([]);
  });

  it("AC-6: parses a comma-separated list, tolerating whitespace, empty entries and duplicates", () => {
    expect(
      resolveHolidays({
        RELAY_HOLIDAYS:
          "2027-01-01, 2026-12-25 ,2026-12-24,,2026-12-25,",
      }),
    ).toEqual(["2026-12-24", "2026-12-25", "2027-01-01"]);
  });

  it("AC-7: an invalid entry throws an error naming RELAY_HOLIDAYS and the entry", () => {
    for (const bad of [
      "2026-13-01",
      "2026-02-30",
      "2026-1-5",
      "25/12/2026",
    ]) {
      expect(() =>
        resolveHolidays({
          RELAY_HOLIDAYS: `2026-12-25,${bad}`,
        }),
      ).toThrow(new RegExp(`^RELAY_HOLIDAYS: .*"${bad}"`));
    }
  });

  it("AC-7: the server refuses to start with an invalid RELAY_HOLIDAYS", async () => {
    const started = run(
      process.execPath,
      ["--import", "tsx", "src/server.ts"],
      {
        cwd: apiDir,
        env: {
          ...process.env,
          PORT: "0",
          RELAY_HOLIDAYS: "2026-12-25,2026-13-01",
        },
        timeout: 15_000,
      },
    );
    const err = await started.then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(err).toMatchObject({
      code: 1,
      killed: false,
      stderr: expect.stringContaining(
        'RELAY_HOLIDAYS: "2026-13-01"',
      ),
      stdout: expect.not.stringContaining("listening"),
    });
  });
});
