# Quiz — Context Engineering

1. Which inputs can change when you give two agent sessions the same prompt?
2. What belongs in the initial brief for a repository investigation?
3. When should the agent retrieve a file on demand?
4. What should be saved before compaction?
5. How can you test whether a handoff is sufficient?
6. What should a sub-agent return to make its work reviewable?
7. What should you do when a handoff contradicts the current spec?

## Answers

1. Standing instructions, available tools, conversation history, tool outputs and the checkout can all differ.
2. The goal and scope, revision, governing source, useful starting point and a checkable observation.
3. When it answers a relevant question that arises during the investigation, especially if it is large or changes frequently.
4. The revision, exact reproduction, decision and source, next action and unresolved questions that matter.
5. Give it to a fresh session. Check the rule the session cites and rerun the evidence it reports.
6. The source, revision, observed result and reproduction command, plus any uncertainty that changes the conclusion.
7. Read the spec at the pinned revision and rerun the check. Surface the discrepancy before updating the note or the product.
