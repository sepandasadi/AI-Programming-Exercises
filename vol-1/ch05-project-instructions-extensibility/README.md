# Vol. 1, Ch. 5: Project Instructions & Extensibility

Exercises for instruction files, commands, skills, hooks, MCP and
sub-agents. Start from tag `v1-ch05`, where Relay has the agent
config built in the chapter: layered `AGENTS.md` files, skills in
`relay/.agents/skills/` (linked from `relay/.claude/skills`), hooks in
`relay/scripts/hooks/`, GitHub's MCP server in `relay/.mcp.json` and
`relay/.codex/config.toml`, the `reviewer` sub-agent, and
`pnpm agents:check`. `relay/README.md` lists what each tool reads.

| Folder | Goal | Verification |
| --- | --- | --- |
| [exercise-01-trim-the-instructions](exercise-01-trim-the-instructions/) | Cut a 110-line `AGENTS.md` to what belongs | `pnpm agents:check` passes; prompt or memory inspection shows the directory layer |
| [exercise-02-command-and-skill](exercise-02-command-and-skill/) | Add `GET /sla` with `/task` and the `add-api-route` skill | `spec:check` passes; the smoke script prints the table and `HTTP 200` |
| [exercise-03-stop-hook](exercise-03-stop-hook/) | Keep the agent working while `pnpm typecheck` fails, without a loop | The hook's tests pass, including `stop_hook_active` |
| [exercise-04-read-only-mcp](exercise-04-read-only-mcp/) | Connect GitHub's MCP server read-only | The MCP response matches `gh`; the server exposes only read tools |
| [challenge](challenge/) | Grade the reviewer sub-agent on a change with planted bugs | Every finding reproduced or rejected; each planted problem found or missed |
| [quiz.md](quiz.md) | Ten questions with answers | |

## What was tested, and how

- Exercises 1–3 and the challenge: every starter and solution was run
  against `v1-ch05` with the green gate, `spec:check`, `agents:check`
  and the smoke script. Outputs quoted in the READMEs are from those
  runs.
- Exercise 4: the config was parsed with `claude mcp get github` and
  `codex mcp get github`. The live call needs your own fine-grained
  token and was not run by the author.
- Steps that ask *your* agent to do something (the canary, `/task`, the
  reviewer) depend on your tool and model; the READMEs say what a pass
  looks like.
