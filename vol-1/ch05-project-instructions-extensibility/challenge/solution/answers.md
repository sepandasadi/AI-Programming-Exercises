# Answers: what was planted

Four problems, all passing the gate and `spec:check`.

1. **Wrong behavior: P3's clock.** `packages/core/src/sla.ts` says P3 is
   40 hours on the `calendar` clock; triage uses 40 *business* hours.
   Reproduce: start the API and `curl localhost:3000/sla` shows
   `{"priority":"P3","hours":40,"clock":"calendar"}`; `POST /triage`
   with `fixtures/issues/feature-request.json` (a P3) returns a
   respond-by a full working week out, not 40 hours later. A user
   reading `/sla` is told the wrong deadline.
2. **Constraint broken: a second copy of the table.** The spec says
   `slaTable()` reads the table `triageIssue` uses. `sla.ts` hard-codes
   its own copy, which is how problem 1 could happen at all, and how it
   would happen again after the next SLA change.
3. **A test that can't fail on the clock.** The AC-2 test uses
   `toMatchObject` with `priority` and `hours` only. Change any `clock`
   value and it still passes.
4. **A test that skips the case that would fail.** The AC-3 test loops
   over `slaTable().slice(0, 3)`, with a comment that P3 "runs into the
   next week; triage.test.ts covers it." Remove the `slice` and it fails
   on P3 — which is the bug.

Problems 3 and 4 are the reason 1 and 2 survived. A reviewer that reads
the spec, asks of each test "could this fail if the code were wrong?",
and confirms by running code (Ch. 7, 7.5 and 7.6) should find all four.
The fix is Exercise 2's solution: `slaTable()` in `triage.ts`, built from
`SLA`, with the full `toEqual` and no `slice`.
