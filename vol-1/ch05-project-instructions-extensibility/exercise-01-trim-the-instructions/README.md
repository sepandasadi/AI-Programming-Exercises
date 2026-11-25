# Exercise 1: Trim an instruction file

**Goal:** cut a bloated `AGENTS.md` down to what an agent can't work out
for itself, move one procedure into a skill, and prove a directory layer
loads.

## Instructions

1. Start from tag `v1-ch05` on a new branch. Copy
   `starter/relay/AGENTS.md` over `relay/AGENTS.md`.
2. From `relay/`, run `pnpm agents:check`. It fails:

   ```text
   FAIL    AGENTS.md: 110 lines (max 60)
   FAIL    AGENTS.md: mentions `apps/api/src/routes/`, which does not exist
   FAIL    AGENTS.md: mentions `packages/shared/`, which does not exist
   FAIL    AGENTS.md: `pnpm test:unit` is not a script
   FAIL    AGENTS.md: `pnpm lint` is not a script
   ```

3. The check finds only what a script can find. Go through the file line
   by line and sort each line into: keep, delete (a tool enforces it, the
   agent can read it from the code, or it is a wish), move to a skill,
   move to a directory `AGENTS.md`, or remove at once. One line belongs
   in the last group, and no script flagged it.
4. Rewrite the file in at most 60 lines. The "Adding an API route"
   procedure already exists as the `add-api-route` skill; compare the
   two and move anything the skill lacks into it.
5. Add one rule to `apps/api/AGENTS.md` or `packages/core/AGENTS.md`
   that the root file no longer says.

## Verification

- `pnpm agents:check` prints `ok      agent config`.
- Canary: add the line ``- End every reply with the line `canary: api`.``
  to `apps/api/AGENTS.md`, start a fresh session in `relay/`, and ask
  the agent to summarize `resolveDocsRoot` in `apps/api/src/config.ts`.
  A pass is a reply ending with `canary: api`. Then remove the canary.
- Codex users can also run `codex debug prompt-input` from
  `relay/apps/api` and find both files in the output (the project must
  be trusted).

## Solution

The solution is Relay's own `relay/AGENTS.md` at `v1-ch05`
(`git checkout v1-ch05 -- relay/AGENTS.md`). `solution/NOTES.md`
explains where each part of the starter went.
