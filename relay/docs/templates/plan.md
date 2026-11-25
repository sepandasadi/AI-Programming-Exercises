# Plan: <feature> (v0)

Spec: `docs/specs/<feature>.md`. Run all commands from
`relay/`. One task per session; the human reruns the
verification, reviews the diff and commits.

**Green gate:** `pnpm build && pnpm typecheck && pnpm test`

## Implementation decisions

Decisions that don't change behavior. Anything that does
belongs in the spec.

## Tasks

- [ ] **Task 1: <name>**
  - Files: <files touched>
  - Covers: AC-n
  - Verify: <command, ending with the green gate>

## Final verification

- [ ] `pnpm spec:check docs/specs/<feature>.md` passes.
- [ ] The spec's manual check.

## Coverage

| AC | Tasks |
| --- | --- |
| AC-1 | |
