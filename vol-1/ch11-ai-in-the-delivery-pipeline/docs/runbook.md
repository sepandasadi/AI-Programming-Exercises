# Rehearse the Relay handoff rollback

- **Owner** Relay API on-call rotation
- **Trigger** A verified handoff mismatch during the candidate window
- **Scope** The synthetic `handoff_formatter_v2` flag

1. Record the decision and the window's checked and mismatched counts per
   arm. Stop widening exposure. In the regression replay, the candidate
   drops the UTC suffix at midnight. The control window is clean.
2. Disable the flag. In this simulation the `rollback` command replays the
   regression with exposure set to zero and the regressed formatter still
   available behind the flag.

   ```sh
   node lab/release.mts rollback
   ```

3. Confirm `restored`, `flagPercent` at zero, bucket 9 and bucket 10 on
   control, 40 checked handoffs with zero mismatches on control, and zero
   observations on the candidate. Replaying issue 43 through the former
   candidate cohort checks that its displayed deadline again includes UTC.
4. If any check fails, keep promotion stopped and involve the release
   owner. Inspect the observed route and the handoff evidence. Record the
   release label, flag setting, decision, and verification output in the
   release log before handing off to the next operator.

In a deployed service, verify observed flag propagation and repeat the
probe where the problem occurred. Confirm recovery using service signals
and check outstanding work that a flag change may leave in flight.
