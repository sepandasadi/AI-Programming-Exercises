# Exercise 4: Read-only MCP

**Goal:** connect GitHub's MCP server with the least privilege that
works, check the agent's answer against a source it didn't produce, and
confirm it can't write.

## Instructions

1. Fork `sepandasadi/AI-Programming-Exercises` and open two or three
   issues in your fork.
2. Create a **fine-grained** personal access token with access to your
   fork only and read-only Issues and Pull requests permissions. Export
   it in your shell as `GITHUB_MCP_TOKEN`. Don't put it in `.env` or any
   file in the repo: Claude Code and Codex expand `${GITHUB_MCP_TOKEN}`
   from the environment they start in.
3. Start your agent in `relay/`. Relay's `.mcp.json` (Claude Code,
   Copilot) and `.codex/config.toml` (Codex) already name the server.
   Approve it when asked (Claude Code asks once per project; Codex loads
   project config only in a trusted project). For another tool, write the
   equivalent entry from the Tool Lens sidebars in 5.8.
4. Use `/mcp` in Claude Code or Codex to inspect the connected server.
   From a shell, `claude mcp get github` or `codex mcp get github`
   checks the local configuration.

## Verification

- Ask: "Using the GitHub MCP server, list the open issues in
  `<you>/AI-Programming-Exercises` with their numbers and titles." Then
  run `gh issue list --repo <you>/AI-Programming-Exercises --state open`.
  Confirm the MCP call in the trace, then compare the numbers and titles.
- In `/mcp`, inspect the GitHub server’s tools. Check that it offers
  issue reads and exposes no tool for commenting or other writes.
- Remove `X-MCP-Toolsets` and restart: count the GitHub tools listed in
  `/mcp` before and after. Put the header back.

## Solution

There is no code to write. `relay/.mcp.json` and
`relay/.codex/config.toml` at `v1-ch05` are the solution. The author
checked that both parse (`claude mcp get github`, `codex mcp get github`)
and that Claude Code warns when `GITHUB_MCP_TOKEN` is unset. The live
calls need your token and were not run by the author.
