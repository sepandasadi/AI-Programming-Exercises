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
   file in the repo. Claude Code expands the variable in `.mcp.json` and
   Codex reads the variable named by `bearer_token_env_var`.
3. Start your agent in `relay/`. Relay's `.mcp.json` (Claude Code,
   Copilot) and `.codex/config.toml` (Codex) already name the server.
   Approve it when asked (Claude Code asks once per project; Codex loads
   project config only in a trusted project). For another tool, write the
   equivalent entry from the Tool Lens sidebars in 5.8.
4. Use `/mcp` in the session to look for `github`. From `relay/`, Claude
   Code also supports `claude mcp get github` for local inspection. In Codex,
   if the server is missing in the trusted session, use the launch flags below.

### Codex launch flags

From `relay/` in Bash or Zsh, set these session overrides. They mirror the
checked-in Codex fixture. The first command checks the settings locally
without authenticating. The second launches the session with those settings.

```sh
github_mcp=(
  -c 'mcp_servers.github.url="https://api.githubcopilot.com/mcp/readonly"'
  -c 'mcp_servers.github.bearer_token_env_var="GITHUB_MCP_TOKEN"'
  -c 'mcp_servers.github.http_headers={ "X-MCP-Toolsets" = "issues,pull_requests" }'
)
codex mcp get github "${github_mcp[@]}"
codex "${github_mcp[@]}"
```

The local check should report `streamable_http`, the `/mcp/readonly` URL,
`GITHUB_MCP_TOKEN` as the variable name, and the `X-MCP-Toolsets` header.
Check the live connection and tool list in `/mcp` after launching. If
the HTTP endpoint returns `401`, check that the session inherited
`GITHUB_MCP_TOKEN` from its launching shell and that the token is valid
for the selected repository.

## Verification

- Ask: "Using the GitHub MCP server, list the open issues in
  `<you>/AI-Programming-Exercises` with their numbers and titles." Then
  run `gh issue list --repo <you>/AI-Programming-Exercises --state open`.
  Confirm the MCP call in the trace, then compare the numbers and titles.
- In `/mcp`, inspect the GitHub server’s tools. Check that it offers
  issue reads and exposes no tool for commenting or other writes.
- Remove `X-MCP-Toolsets` from the configuration you are using and restart.
  With the launch flags, set the `http_headers` override to `{}` for this
  comparison. Count the GitHub tools in `/mcp` before and after, then restore
  the header.

## Solution

There is no code to write. `relay/.mcp.json` and
`relay/.codex/config.toml` in the chapter checkout hold the settings. A
clean checkout was checked with `claude mcp get github` and Codex's explicit
launch flags. The live check needs your token.
