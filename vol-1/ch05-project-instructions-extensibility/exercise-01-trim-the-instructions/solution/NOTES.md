# Where each part of the starter went

| Starter section | Decision | Why |
| --- | --- | --- |
| Persona ("world-class senior engineer") | Deleted | Changes nothing the agent does |
| About Relay | Cut to one sentence | The agent needs what Relay is, not its history |
| Repository tour | Deleted, except the two packages | The agent reads the tree itself; two entries were stale (`apps/api/src/routes/`, `packages/shared/`) |
| Code style | Deleted | Prettier enforces it, and the `format-edited.mjs` hook runs Prettier after every edit. "Always follow best practices" and the all-caps line are wishes |
| Commands | Kept, corrected | `npm install`, `pnpm test:unit` and `pnpm lint` were wrong. The green gate (`pnpm build && pnpm typecheck && pnpm test`, build first) is the most useful line in the file |
| Adding an API route | Moved | Already the `add-api-route` skill; needed on few tasks |
| Testing | Kept the AC naming rule | Vitest is visible in `package.json`; "100% coverage" and "make sure tests pass" are wishes; the green gate replaces the second |
| Architecture rules | Kept; details moved down | The root keeps "logic in core, routes thin"; core's rules (no `process.env`, no hidden clocks) moved to `packages/core/AGENTS.md` |
| Environments: staging password | **Removed at once** | A credential in a committed file. Rotate it, and check history (`git log -S`). No script flagged it, which is why review still matters |
| Git | Kept "do not commit" | Imperative mood and no force-push are fine habits but not worth a line on every task |
| Misc | Kept dependencies and `.env` as Boundaries | "Be concise", "think carefully" and "ask if unsure" are wishes |
