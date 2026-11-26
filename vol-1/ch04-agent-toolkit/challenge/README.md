# Challenge — Switch harnesses

Hand the task to a teammate with a different execution environment. If you worked in an IDE, describe a CLI or hosted run. If you did the replay, assume the teammate will use an IDE connected to a remote development container. Draft a brief with the exact starting files, the scope of approved actions, the test command and the two expected outcomes. State which identity would run commands and where the proposed edit would land.

**Verify.** Replay the task with the provided files. Then use the following questions to review the handoff.

- If the remote environment lacks Node, can the teammate distinguish that failure from the expected assertion?
- Can the teammate identify the boundary that keeps the test file unchanged and what to do if the harness cannot enforce a one-file write rule?
- Can they review the same diff and run the same test without your chat history or any provider-specific state?

A correct handoff names the failing case and both displayed citations, keeps the reviewer in control of writes beyond the fixture, and distinguishes the portable test evidence from a new harness's policy and runtime settings. The replay verifies the task evidence. Inspect the new environment to verify its controls.
