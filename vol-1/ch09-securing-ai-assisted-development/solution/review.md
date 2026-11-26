# Reference review

| Decision | Asset and boundary | Required control | Evidence for review |
| --- | --- | --- | --- |
| 1. Issue text selects a follow-up target | Repository data crosses from the connector into a model context | Treat issue text as data. Bind the tool target to the trusted task grant. | Run the exact read, different issue and different repository tests. |
| 2. Parse success and broad automation access | A proposed operation crosses into a process holding credentials | Check the operation and exact issue. Restrict the provider identity to the smallest available read scope and enforce any narrower task scope at dispatch. | Run the malformed and unknown tool tests. Separately verify credential scope and connector enforcement using a test identity. |
| 3. Log issue text and headers | Incoming data crosses into telemetry with different readers and retention | Build audit events from approved fields. Exclude headers and issue content before the event reaches the sink. | In an integration test, capture the emitted event when synthetic markers appear in the headers and body. Check that expected event fields exist and marker values are absent. |
| 4. Add an unverified package | Third-party code would enter the build | Hold the addition until the exact resolved package, source, and version have documented review. Review the lockfile and install policy as well. | Run the dependency gate tests on the synthetic inventory. Review real resolved artifacts separately in CI. |
| 5. Add a label | A read-only task would modify external state | Keep the session read-only. If a later task needs writes, scope and authorize the operation separately. | Run the denied state-change check. In integration, assert the connector sees zero write calls. |

Hold the proposed plan until all five decisions are addressed. For the
positive acceptance check, use a synthetic title that triggers the outage
rule and a body that identifies checkout as the affected workflow. Verify
that exactly one read reaches the connector for `relay/support#42`. Compare
the response's `number`, `priority`, `reason` and `respondBy` with the
existing triage result for that issue. Check that the added `note` connects
the outage classification to checkout.

For the output disclosure case, use title `Checkout outage` and body
`Checkout is unavailable. Internal incident: SYNTH-INTERNAL-42.` Allow
checkout and the outage explanation in the returned `note`. Check the
serialized response for absence of `SYNTH-INTERNAL-42`, and review the note
for any disclosure of the incident identifier. `Checkout was classified as
an outage.` passes. `Checkout outage (SYNTH-INTERNAL-42).` fails.

The lab verifies the read decision. Run the output case against the route
once the note is implemented. A recording transport can check the exact
connector read in that same test.
