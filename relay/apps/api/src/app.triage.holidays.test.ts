// spec: triage-holidays
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const fixture = (name: string) =>
  readFile(
    new URL(
      `../../../fixtures/issues/${name}.json`,
      import.meta.url,
    ),
    "utf8",
  );

async function triage(
  holidays: string[] | undefined,
  body: string,
): Promise<unknown> {
  const res = await createApp({ holidays }).request(
    "/triage",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    },
  );
  expect(res.status).toBe(200);
  return res.json();
}

describe("POST /triage with holidays", () => {
  it("AC-8: friday-outage.json with Monday off responds by Tuesday 12:30 UTC", async () => {
    expect(
      await triage(
        ["2026-11-30"],
        await fixture("friday-outage"),
      ),
    ).toEqual({
      number: 412,
      priority: "P1",
      reason: "title term outage",
      respondBy: "2026-12-01T12:30:00.000Z",
    });
  });

  it("AC-8: without holidays the route is unchanged (Monday 12:30 UTC)", async () => {
    const body = await fixture("friday-outage");
    for (const holidays of [undefined, []]) {
      expect(await triage(holidays, body)).toMatchObject({
        respondBy: "2026-11-30T12:30:00.000Z",
      });
    }
  });

  it("AC-5: weekend-p0.json stays 60 calendar minutes, whatever the holidays", async () => {
    // Created Saturday 2026-11-28 22:45 UTC.
    expect(
      await triage(
        ["2026-11-28", "2026-11-29", "2026-11-30"],
        await fixture("weekend-p0"),
      ),
    ).toMatchObject({
      priority: "P0",
      respondBy: "2026-11-28T23:45:00.000Z",
    });
  });
});
