import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

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
  return RELAY_DOCS_DIR ? resolve(cwd, RELAY_DOCS_DIR) : DEFAULT_DOCS_ROOT;
}
