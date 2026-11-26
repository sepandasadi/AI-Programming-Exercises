# Quiz: Ch. 5, Project Instructions & Extensibility

1. Name two properties of an instruction file that decide what belongs
   in it.
2. Give three kinds of content that don't belong in `AGENTS.md`, and
   where each goes instead.
3. Why is a wrong instruction worse than a missing one, and what can
   catch some wrong instructions automatically?
4. Codex and Claude Code combine directory-level instruction files
   differently. How, and what does that mean for a rule in
   `packages/core/AGENTS.md`?
5. What does a canary tell you about whether an agent followed an
   instruction? How can you check whether the tool loaded the file?
6. What is progressive disclosure in a skill, and why does it make the
   description so important?
7. Relay's `task` skill sets `disable-model-invocation: true` and also
   ships `agents/openai.yaml`. Why both?
8. In Claude Code, a guard hook exits 1 because its script crashed.
   What happens to the tool call, and how does Relay's `protect-env`
   hook avoid that?
9. Name three choices in Relay's `.mcp.json` entry for GitHub that
   reduce what the agent can do or see, and say what each prevents.
10. Why does Relay's reviewer sub-agent keep Bash, and what does that
    mean for "never edits the repo"?

## Answers

1. It is always loaded, so every line costs context on every task; and it
   is advice, so nothing enforces it.
2. Any three of: rules a tool enforces (formatting, lint) → the tool, run
   by a hook; procedures needed on some tasks → a skill; a tour of the
   repo → nowhere, the agent reads the code; wishes such as "write clean
   code" → nowhere; personal preferences → your user-level file;
   secrets → never in a file the agent reads.
3. The agent follows it confidently, so every task pays for it (a renamed
   script is run, fails, and costs a turn). `pnpm agents:check` catches
   paths that don't exist, `pnpm` scripts that aren't defined and broken
   `@` imports; it can't catch a rule that is wrong but well formed.
4. Codex concatenates every `AGENTS.md` from the project root to the
   working directory at start, nearest last. Claude Code (and Gemini CLI)
   load a subdirectory's file only when the agent opens a file there. A
   rule in core's file is invisible to a Claude Code session that never
   touches core, and to a Codex session started outside core.
5. A harmless, observable instruction such as “end every reply with
   `relay-api-canary`.” The marker in a reply shows the model followed the
   instruction in that run. Use prompt inspection or the tool’s loaded
   file list to check whether the directory layer was loaded.
6. At startup the agent sees only each skill's name and description; it
   loads the body when a task matches and the skill's other files only
   if the body sends it there. The description is the only part the
   agent sees when deciding, so it must say what the skill covers and
   when to use it.
7. Each tool reads only its own field: Claude Code reads
   `disable-model-invocation`, Codex reads
   `policy.allow_implicit_invocation` in `agents/openai.yaml`. Unknown
   fields are skipped silently, so without the second file Codex offered
   `task` for implicit use.
8. By default, exit 1 lets the call go ahead. Relay’s `protect-env`
   exits 2 when the input cannot be parsed. Its wiring also sets
   `onFailure: "block"` so an exit 1 or a timeout blocks the call.
   `${CLAUDE_PROJECT_DIR}` keeps the script path stable across directories.
9. `/readonly` in the URL (no write tools, so no wrong comments or
   merges); `X-MCP-Toolsets: issues,pull_requests` (fewer tools, less
   context and less room to wander); `${GITHUB_MCP_TOKEN}` from the
   environment, which should be a fine-grained read-only token (no
   secret in the repo, and no access beyond the repos it names).
10. Confirming a behavior finding means running code. With Bash it can
    still write files, so "never edits the repo" is an instruction, not a
    guarantee; for a guarantee, give it a read-only checkout or sandbox.
