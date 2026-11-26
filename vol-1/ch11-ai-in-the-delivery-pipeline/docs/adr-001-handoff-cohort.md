# ADR 001 — Keep workspace assignment stable during rollout

**Status** Accepted for the Relay exercise.

## Context

Engineers in the same workspace can compare handoffs in one shift log.
Per-request random allocation could expose that workspace to both formats
and make a report hard to reproduce.

## Decision

Use a stable workspace bucket. A workspace is exposed when its bucket is
strictly lower than the flag percentage. Zero exposes none of the buckets.
The exercise supplies the bucket directly in each synthetic replay.

## Consequences

Investigators can revisit the same cohort and compare its behavior after
rollback. Observations from one workspace can be correlated. Real rollouts
need broader coverage than repeated cases from a few workspaces. Revisit
this decision if exposure has to be uniform across workspaces that share a
handoff queue.
