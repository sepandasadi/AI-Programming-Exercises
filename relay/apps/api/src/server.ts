import { serve } from "@hono/node-server";
import { loadDocs } from "@relay/core";
import { createApp } from "./app.js";
import {
  resolveDocsRoot,
  resolveHolidays,
} from "./config.js";

const port = Number(process.env.PORT ?? 3000);
// A bad RELAY_HOLIDAYS throws here, before anything is served.
const holidays = resolveHolidays();
const docsRoot = resolveDocsRoot();

// The index is built once at startup (spec non-goal: no persistence).
// A missing root throws here, so a bad RELAY_DOCS_DIR fails fast.
const sections = await loadDocs(docsRoot);
console.log(
  `Loaded ${sections.length} sections from ${docsRoot}`,
);
console.log(
  `Holidays: ${holidays.length ? holidays.join(", ") : "none"}`,
);

serve(
  { fetch: createApp({ sections, holidays }).fetch, port },
  (info) => {
    console.log(
      `Relay API listening on http://localhost:${info.port}`,
    );
  },
);
