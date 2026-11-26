# Relay triage handoff contract

This is an offline presentation layer exercise. Relay already returns a
priority and `respondBy` from triage. Imagine a caller combines those fields
with an issue number and whether an owner was assigned. It uses that input
to prepare a plain-text handoff line for review.

- `priorityLabel` maps P0 to `Critical`, P1 to `High`, P2 to `Normal` and P3
  to `Low`. Preserve the exported `Priority` type and function signature.
- `formatDeadline` displays a canonical UTC timestamp from `Date#toISOString`
  for a four-digit year as `YYYY-MM-DD HH:mm UTC`. Drop seconds and
  milliseconds without rounding. The displayed values stay in UTC in any
  host time zone. Preserve leading zeroes in the year. Its caller has
  already validated the value.
- `ownershipHint` returns `Confirm the owner` for an assigned issue and
  `Assign an owner` for an unassigned issue.
- `formatHandoff` combines the three display fields with the issue number
  in this format: `#42 High | Respond by 2026-11-25 21:45 UTC | Assign an owner`.
  The integration owner keeps the composer and tests fixed during dispatch.

Each worker edits one formatter and runs its focused check. The integration
owner runs the full suite after joining the branches. Use Node.js 22.18 or
newer. All inputs are synthetic. No service or credential is needed.
