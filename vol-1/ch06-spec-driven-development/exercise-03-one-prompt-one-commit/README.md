# Exercise 3: One prompt, one commit

**Goal:** implement the stale issue report with your agent, one task
per prompt and one reviewed commit per task.

## Instructions

1. Start from tag `v1-ch06` on a new branch.
2. Put your spec and plan from Exercises 1 and 2 in `relay/docs/`.
3. For each task, start a fresh session and use the prompt from
   Listing 6.5 with your task number and file names.
4. After each task: rerun the verification command yourself, read the
   whole diff, then commit with a message that names the task.

## Verification

- `pnpm spec:check docs/specs/stale-issues.md` lists every criterion as `ok`.
- `pnpm build && pnpm typecheck && pnpm test` pass.
- `git log --oneline v1-ch06..` shows one commit per task.
- For at least one test, break the code on purpose (for example,
  change `>=` to `>` in the age check) and confirm the test named
  after that criterion fails. A test that still passes is not testing
  its criterion.

## Solution

`solution/relay/` mirrors the paths in `relay/`. The route is mounted
in `apps/api/src/app.ts` with
`app.route("/issues", staleIssuesRoute(issues))`, and core exports
`staleIssues`, `IssueSchema` and the types from `packages/core/src/index.ts`.
