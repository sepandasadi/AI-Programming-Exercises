# Challenge — Resolve a stale claim

Make a scratch copy of [the sample handoff](../exercise-03-test-a-handoff/solution/handoff.md).
Replace its decision with “`limit=2.0` was accepted.” Remove the earlier
result for `limit=2.0` and replace the next action with “Tell the caller
both spellings work.” Keep the revision and reproduction command. Give
the modified note and the lab checkout to a fresh session. Ask it to
verify the claim before drafting an internal response. Leave the code
unchanged.

## Verification

The report should identify the conflict, cite AC-6 and Behavior at
`v1-ch07`, and show both observed responses. Check the session trace for
the reproduction command. The report should preserve uncertainty about a
deployment you have not checked.

## Solution notes

The handoff is a claim. The pinned spec states the expected behavior and
the two requests show the observed behavior on that checkout. Restore the
checked decision and use the exact reproduction in the corrected note.
