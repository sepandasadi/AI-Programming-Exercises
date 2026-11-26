# Worked boundary

| Action | Decision and control |
| --- | --- |
| Read the fixture | Allow workspace reads. Inspect which folder the harness opened. |
| Edit the formatter | Allow after the plan is accepted. A file-scoped edit policy can enforce this where supported. Otherwise review the diff and keep the checkout disposable. |
| Edit the test | Deny. A path rule can protect it if the harness applies that rule to both direct edits and shell writes. |
| Run the supplied test | Allow in the fixture directory. A shell approval and the runtime can govern the command's reach. |
| Install a formatter | Decline. Keep agent tool egress disabled and package installs outside this task. |
| Push before review | Decline. Keep remote write credentials and write-capable repository tools outside the session. |

The model can propose any of these actions. The harness checks its tools, and the execution environment bounds processes. In the replay, Node runs the test locally and the scripted edit gate rejects any filename other than `format-hit.mts`. In a live session, verify each layer separately. A writable workspace can include both files even when the prompt calls one file locked.
