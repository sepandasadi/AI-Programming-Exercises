# Exercise 2: A command and a skill

**Goal:** add `GET /sla`, which returns the respond-by allowance for each
priority, using the `/task` command for each plan task and letting the
`add-api-route` skill guide the route.

## Instructions

1. Start from the chapter checkout on a new branch. Copy `starter/relay/` over
   your `relay/` folder: it adds the spec
   (`docs/specs/sla-table.md`) and a two-task plan
   (`docs/plans/sla-table.md`).
2. Read the spec. Note its constraint: one table. `slaTable()` must read
   the table `triageIssue` uses, not a copy.
3. In a fresh session, run `/task sla-table 1` (Claude Code), or invoke
   the `task` skill your tool's way with the arguments `sla-table 1`
   (Codex: `$task sla-table 1`). Review the diff, rerun the gate, commit.
4. In another fresh session, run `/task sla-table 2`. This task adds a
   route, so the agent should load `add-api-route` without being told.
   Check the trace for the skill and the report for the smoke output.
   If the skill was skipped, invoke it explicitly and rerun Task 2 from
   the checkpoint. `GET /sla` takes no input, so the handler needs no
   request schema.
5. If your tool doesn't read `.agents/skills/` or `.claude/skills/`, add
   the skill where it does look (see the Tool Lens sidebars in 5.8).

## Verification

From `relay/`:

```text
$ pnpm build && pnpm typecheck && pnpm test
$ pnpm spec:check docs/specs/sla-table.md
ok	AC-1
ok	AC-2
ok	AC-3
$ bash .agents/skills/add-api-route/scripts/smoke.sh /sla
{"priorities":[{"priority":"P0","hours":1,"clock":"calendar"},{"priority":"P1","hours":4,"clock":"business"},{"priority":"P2","hours":16,"clock":"business"},{"priority":"P3","hours":40,"clock":"business"}]}
HTTP 200
```

Then break the one-table constraint on purpose: change P2's allowance in
the `SLA` table in `triage.ts` to `8 * HOUR`. Both the AC-2 and AC-3
tests must fail. If only one does, the tests don't pin the constraint.

## Solution

`solution/relay/` mirrors `relay/`: the spec and plan, `slaTable()` in
`packages/core/src/triage.ts` (read from the existing `SLA` table), its
tests in `sla.test.ts`, the route in `apps/api/src/app.ts`, its test in
`app.sla.test.ts`, and a README section. In the original verification run, the
gate passes (200 core, 56 API and 35 script tests), `spec:check` lists
AC-1 to AC-3 as `ok`, and the smoke output is the one above.
