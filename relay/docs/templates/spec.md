# Spec: <feature> (v0)

Status: draft · Owner: <name>

## Problem

Why this exists, in two or three sentences.

## Goal

What done looks like, in one or two sentences.

## Non-goals

- Things a capable agent might reasonably add, ruled out.

## Behavior

Definitions of every term the criteria use, and the rules
that connect them.

## Acceptance criteria

- AC-1: One condition, one observable result.
- AC-2: Name boundaries, ties and failure behavior.

## Interface

Types, function signatures, endpoints.

## Constraints

Dependencies, layering, performance, security.

## Verification

- Every AC has a test titled `AC-n: ...` in a file tagged
  `// spec: <feature>`: `pnpm spec:check
  docs/specs/<feature>.md` passes.
- `pnpm build && pnpm typecheck && pnpm test` pass.
- Manual: a check a human can run in a minute.

## Open questions

Must be empty before implementation starts.
