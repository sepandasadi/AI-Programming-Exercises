# Quiz — Your Agent Toolkit

1. Which part proposes a tool call, and which part decides whether to execute it?
2. An IDE window is open on your laptop. What could make its terminal run elsewhere?
3. Does creating a Git worktree limit which files a shell process can read?
4. A test command exits `1` because it cannot load a module. Is that good baseline evidence for a citation fix?
5. What should move with the task when you switch providers?

## Answers

1. The model can propose a call. The harness routes it through policy and invokes the tool in an execution environment when allowed.
2. The IDE can be attached to a remote host or a container. Check the terminal and tool execution context.
3. A worktree gives you a separate checkout and index. Process limits come from a separate boundary such as an enforced sandbox or a VM.
4. The baseline must reach the test and fail the intended assertion. Fix the environment before drawing a conclusion about behavior.
5. Move the starting revision or fixture, intended behavior, authorized scope, verification command and observed evidence. Recheck permissions and execution location in the new harness.
