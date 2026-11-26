# Vol. 1, Ch. 10 — Multi-Agent & Background Workflows

Build a plain-text Relay triage handoff in three independent worktrees,
then test the joined result. The lab uses TypeScript, Git and Node.js
22.18 or newer. All data is synthetic. The reference replay runs offline.
For a live run, use three separate coding-agent sessions with access limited
to the scratch worktrees. Your provider's own model access may require a
network connection.

| Exercise | Verification |
| --- | --- |
| [Split the work](exercise-01-split-the-work/) | Check the shared base and record each worker's file and contract |
| [Dispatch three workers](exercise-02-dispatch-three-workers/) | Run focused tests and verify each branch's changed paths |
| [Integrate the branches](exercise-03-integrate-the-branches/) | Merge locally and run all five checks on the joined revision |
| [Challenge](challenge/) | See an ownership omission survive a focused check and fail the combined check |
| [Quiz](quiz.md) | Check your reasoning against the answers |

Start in this chapter folder and run the commands in the same shell so
`chapter_dir`, `scratch`, `integration` and `base` remain available. The
exercises create a new local repository with no remote. Your branch names
in the book's repository are independent of the branch names in the lab.

The reference implementations are under [`solution/src`](solution/src/).
The same three changes can come from your agent sessions or from the
reference implementations. Review every diff before combining them.
