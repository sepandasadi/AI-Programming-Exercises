# Release packet review

1. `relay-11.0` is the control label. Ask for the test result and artifact
   identity for the proposed `relay-11.1` revision and link them in the packet.
2. Assign a Relay maintainer to evaluate the reviewed revision and the Relay
   API rotation to own exposure. Identify the on-call operator who can act on
   a stop decision.
3. Compare the full handoff against known expected text for each arm. Check
   both sides of the bucket boundary. Count verified mismatches, require at
   least 20 observations per arm, and stop on any verified mismatch.
4. Confirm flag propagation with a probe from the previously exposed cohort.
   Check both the observed route and the restored UTC deadline. Keep promotion
   stopped if recovery evidence is incomplete.

The [completed packet](../../docs/release-packet.md) records these decisions.
