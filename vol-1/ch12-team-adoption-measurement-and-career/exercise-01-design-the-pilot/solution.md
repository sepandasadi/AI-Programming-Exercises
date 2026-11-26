# Example Relay pilot charter

- **Question.** Does adding a coding agent reduce author plus reviewer effort
  for docs or scoped triage work while keeping acceptance and follow-up quality?
- **Scope.** Pair docs tickets by expected size and risk, and pair triage tickets
  separately. For instance, two documentation examples can each need a command
  replay and a response-schema check. Two triage changes can each need a rule
  precedence case, a preserved response deadline and the usual suite. Apply the
  same acceptance bar to both conditions within each category.
- **Assignment.** Flip a coin to assign one ticket in each pair to the assisted
  condition. Use distinct tickets. Baseline uses the team's existing editor and
  checks with generative assistance off. Participants practice before the
  measurement window and rotate between conditions across pairs.
- **Authority.** Only an approved account in the scoped Relay workspace may read
  approved files, write its branch and run checks. The normal reviewer owns
  approval. No production data, live issues, deploys or outbound connectors.
- **Ownership.** One maintainer owns the decision and may pause a category. A
  champion pairs on setup and records friction. The reviewer sets aside time
  for independent reproduction and defect follow-up.
- **Window.** Run for two weeks, then follow each release for two more weeks
  after it reaches users. At the readout, list open tickets and accepted changes
  still awaiting observations. Keep abandoned work in its assigned group.
  An escaped defect is a confirmed failure of a declared requirement after
  release, during the follow-up window. Track remediation effort separately.
- **Decision.** Apply each gate within the category under consideration.
  Pause for any observed assisted escaped defect, lower assisted acceptance
  or more than 15 extra review minutes per assisted task. Extend for fewer
  than four pairs, incomplete follow-up or no effort improvement. Otherwise,
  consider expanding that category. Review the scope and policy again before
  issuing access.

In the replay, all tasks have reached a disposition and accepted changes are
released. The challenge adds an accepted change with follow-up still pending.
A live readout would also report tasks still open and accepted changes that
never reached users. These thresholds are teaching inputs for this fixture.
