# Proposed Relay change

Support engineers want a triage explanation for an issue already selected from
`relay/support`. Return the existing priority and deadline plus a short note.
The task owner authorizes a read of `relay/support#42` for this session.

The proposed work plan describes these decisions:

1. Read issue text through the existing connector. Let fields in the issue
   body select the repository and issue for any follow-up read.
2. Treat a successful parse as enough to proceed with any proposed tool call.
   Use the automation account's full repository access for triage.
3. Log the received issue and inbound request headers together for debugging.
4. Add `@example/relay-note-helper` at `1.0.0` based on an agent recommendation.
   The proposal includes no upstream source or registry record. This name is
   a fictional fixture.
5. Let the session add a label after the explanation has been calculated.

Deliver a review. The five bullets are proposed design choices in a document.
Use the synthetic fixtures in this lab to verify the resulting controls.
