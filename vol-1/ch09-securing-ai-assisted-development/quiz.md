# Chapter 9 quiz

1. A proposed tool call passes a runtime schema. What check remains
   before dispatch?
2. Why can a read-only connector still create a disclosure risk?
3. A package is present in the approved registry and pinned in the
   lockfile. What review work remains?
4. A test catches a header marker in your debug log. Which boundary do
   you fix and what check would you add?
5. A secrets scanner and a dependency advisory scan both pass. Which
   evidence would you ask for before trusting the issue-read policy?
6. Why should the policy suite include an allowed read and an exact
   approved dependency in addition to denied cases?

## Answers

1. Apply the host's authorization for the current task. Check the
   specific operation, resource and relevant arguments against the
   independently approved grant.
2. Readable data can still reach a model, a transcript, a log or a
   network destination. Each downstream destination needs permission
   to receive the data.
3. Verify the exact upstream package identity, source, version,
   provenance and integrity evidence where available, dependency
   changes, lifecycle scripts and whether the package is needed.
4. Build the recorded event from a narrow schema before sending it
   to the logging backend. Capture an integration-test event and
   assert it has the required operational fields and omits the marker.
5. Run the positive read and negative operation/resource cases. Also
   observe the dispatcher and connector to confirm that a denied
   request produces no connector call.
6. These cases prove that a blanket denial or hold would fail the
   suite. The system still needs to complete an authorized task.
