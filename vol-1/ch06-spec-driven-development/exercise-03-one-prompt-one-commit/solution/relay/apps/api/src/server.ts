import { serve } from "@hono/node-server";
import { loadDocs } from "@relay/core";
import { createApp } from "./app.js";
import { resolveDocsRoot } from "./config.js";
import {
  DEFAULT_ISSUES_FILE,
  loadIssues,
} from "./issues-file.js";

const port = Number(process.env.PORT ?? 3000);
const docsRoot = resolveDocsRoot();

// The index is built once at startup (spec non-goal: no persistence).
// A missing root throws here, so a bad RELAY_DOCS_DIR fails fast.
const sections = await loadDocs(docsRoot);
console.log(
  `Loaded ${sections.length} sections from ${docsRoot}`,
);

// AC-8: an invalid issue file stops the server here.
const issues = await loadIssues(DEFAULT_ISSUES_FILE);

serve(
  { fetch: createApp({ sections, issues }).fetch, port },
  (info) => {
    console.log(
      `Relay API listening on http://localhost:${info.port}`,
    );
  },
);
