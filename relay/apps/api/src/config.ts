import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { HolidayListSchema } from "@relay/core";

/**
 * `relay/fixtures/team-docs`, found from this module's location rather than
 * the working directory (D10): `pnpm dev` runs in `apps/api`, `pnpm start`
 * may run anywhere. `src/config.ts` and `dist/config.js` are both three
 * levels below `relay/`.
 */
export const DEFAULT_DOCS_ROOT = fileURLToPath(
  new URL("../../../fixtures/team-docs", import.meta.url),
);

const EnvSchema = z.object({
  RELAY_DOCS_DIR: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

/**
 * The docs root the API loads at startup: `RELAY_DOCS_DIR` resolved against
 * `cwd`, or the bundled fixtures when it is unset or blank.
 */
export function resolveDocsRoot(
  env: Record<string, string | undefined> = process.env,
  cwd: string = process.cwd(),
): string {
  const { RELAY_DOCS_DIR } = EnvSchema.parse(env);
  return RELAY_DOCS_DIR
    ? resolve(cwd, RELAY_DOCS_DIR)
    : DEFAULT_DOCS_ROOT;
}

const HolidaysEnvSchema = z.object({
  RELAY_HOLIDAYS: HolidayListSchema.optional().transform(
    (v) => v ?? [],
  ),
});

/**
 * The team holidays the business clock skips: `RELAY_HOLIDAYS`, a
 * comma-separated list of `YYYY-MM-DD` dates (UTC), sorted and without
 * duplicates. Unset or blank means none. See
 * docs/specs/triage-holidays.md.
 *
 * Throws an Error naming `RELAY_HOLIDAYS` and every bad entry, so the
 * server fails at startup rather than serving wrong deadlines.
 */
export function resolveHolidays(
  env: Record<string, string | undefined> = process.env,
): string[] {
  const parsed = HolidaysEnvSchema.safeParse(env);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => issue.message)
      .join("; ");
    throw new Error(`RELAY_HOLIDAYS: ${detail}`);
  }
  return parsed.data.RELAY_HOLIDAYS;
}
