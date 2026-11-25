import { z } from "zod";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True if `s` is a real calendar date written `YYYY-MM-DD`, so
 * `2026-02-30` and `2026-1-5` are false. See
 * docs/specs/triage-holidays.md.
 */
export function isHolidayDate(s: string): boolean {
  if (!DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === s
  );
}

/**
 * A comma-separated list of holidays (the `RELAY_HOLIDAYS` format),
 * parsed to a sorted list without duplicates. Whitespace around entries
 * and empty entries are ignored; blank input is an empty list. Each
 * error names the bad entry.
 */
export const HolidayListSchema = z
  .string()
  .transform((raw) =>
    raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  )
  .superRefine((entries, ctx) => {
    for (const entry of entries) {
      if (!isHolidayDate(entry)) {
        ctx.addIssue({
          code: "custom",
          message: `"${entry}" is not a date in YYYY-MM-DD form`,
        });
      }
    }
  })
  .transform((entries) => [...new Set(entries)].sort());
