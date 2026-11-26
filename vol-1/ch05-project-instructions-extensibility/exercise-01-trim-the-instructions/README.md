# Exercise 1: Trim an instruction file

**Goal:** cut a bloated `AGENTS.md` down to what an agent can't work out
for itself, move one procedure into a skill, and prove a directory layer
loads.

## Instructions

1. Start from the chapter checkout on a new branch. Copy
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
- Add ``- End every reply with `relay-api-canary`.`` to the directory
  file you edited. The steps below use `apps/api` as the example.
- In Codex, run `codex debug prompt-input` from `relay/` and again from
  `relay/apps/api/`. The marker should appear only in the second output.
- In Claude Code, start in `relay/` and ask the agent to open
  `apps/api/src/config.ts` with Read. Check the loaded files in `/memory`.
- Ask for a summary of `resolveDocsRoot`. A reply ending in the marker
  shows the model followed the instruction in that run. If it is missing,
  inspect the loaded instructions before deciding why. Remove the
  temporary line when finished.

## Solution

The solution is `relay/AGENTS.md` from your baseline checkout. `solution/NOTES.md`
explains where each part of the starter went.
