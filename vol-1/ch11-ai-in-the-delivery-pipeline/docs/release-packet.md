# Relay handoff formatter release packet

This is the completed packet for a synthetic release. The roles and revision
labels identify actors and versions within the exercise.

| Field                 | Decision or evidence                                                                                                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope                 | Replace the display formatter for a plain-text triage handoff. Preserve the issue number, priority label, UTC deadline, and ownership hint.                                                                                       |
| Release owner         | Relay API rotation owns the decision to promote or stop. A Relay maintainer reviews the contract and the tested revision.                                                                                                         |
| Revision and exposure | `relay-11.1` represents the candidate, installed with `handoff_formatter_v2` at zero first. For the drill, ten of one hundred workspace buckets are eligible.                                                                     |
| Verification          | Review the complete handoff against independently authored expectations for issues 42 and 43. Check bucket 9 is on the candidate and bucket 10 is on control. Record the exact revision and flag setting when attaching evidence. |
| Proceed               | The maintainer has verified the candidate build evidence. Both arms have at least 20 checked handoffs and zero mismatches. The release owner may approve the next step.                                                                                                                     |
| Hold                  | An arm has fewer than 20 checked handoffs and neither arm has a known mismatch. Keep exposure fixed and investigate if the sample fails to grow.                                                                                  |
| Stop                  | Any verified mismatch in either arm. End promotion. If control also fails, investigate the shared path and verify recovery before declaring the incident resolved.                                                                |
| Recovery              | The on-call operator disables `handoff_formatter_v2` in the replay and verifies the previously exposed cohort. Follow the [runbook](runbook.md).                                                                                  |
| Cleanup               | The Relay API rotation owns removing the flag and old branch after the last rollback window and after verifying all consumers can use the new formatter.                                                                          |

## Candidate build evidence

Missing. The Relay maintainer still needs the CI result tied to the exact
`relay-11.1` candidate build and its artifact identity. Hold any promotion
until the maintainer has verified that record and the canary criteria pass.

## Recorded canary evidence

- **Replay identity** `relay-11.1` is the regressed candidate in this record.
  `relay-11.0` is the control. The [TypeScript fixtures](../lab/fixtures.mts)
  supply the independent handoff expectations.
- **Observation** `node lab/release.mts canary regression` at 10% exposure
  checked 20 handoffs on each arm. Control had zero mismatches. Candidate
  had 10. Bucket 9 reached the candidate and bucket 10 reached control.
  The first mismatch was issue 43 in bucket 0. Its deadline omitted `UTC`.
- **Decision** `stop`, exit status 3. Keep promotion stopped and follow the
  rollback runbook. The [regression test](../lab/canary.test.mts) checks this
  window's counts and decision.

The release labels and captured results are from the local simulation.
