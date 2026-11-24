import { z } from "zod";

export const RELAY_VERSION = "0.0.0";

export const HealthSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
});

export type Health = z.infer<typeof HealthSchema>;

export function health(): Health {
  return { status: "ok", version: RELAY_VERSION };
}
