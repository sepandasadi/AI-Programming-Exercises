import {
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkAgentConfig,
  checkSkill,
  frontMatter,
  hookScripts,
  lineCount,
  pathSpans,
  pnpmScripts,
} from "./check-agent-config.js";

describe("parsing", () => {
  it("finds path spans, skipping placeholders and code", () => {
    const md = [
      "Run `pnpm test` in `apps/api` and read",
      "`docs/specs/<name>.md`, `@relay/core`, `foo.ts`.",
      "```",
      "`not/this`",
      "```",
    ].join("\n");
    expect(pathSpans(md)).toEqual(["apps/api"]);
  });

  it("finds pnpm scripts, with and without --filter", () => {
    const md =
      "`pnpm build && pnpm typecheck`, " +
      "`pnpm --filter @relay/core mutate`, `pnpm install`";
    expect(pnpmScripts(md)).toEqual([
      { script: "build" },
      { script: "typecheck" },
      { filter: "@relay/core", script: "mutate" },
    ]);
  });

  it("reads front matter, including continued lines", () => {
    expect(
      frontMatter(
        "---\nname: a-b\ndescription: one\n  two\n---\nbody",
      ),
    ).toEqual({ name: "a-b", description: "one two" });
    expect(frontMatter("no front matter")).toBeUndefined();
  });

  it("finds the scripts a hook config runs", () => {
    expect(
      hookScripts({
        hooks: {
          PreToolUse: [
            {
              hooks: [
                {
                  command:
                    'node "$CLAUDE_PROJECT_DIR"/scripts/hooks/x.mts',
                },
              ],
            },
          ],
        },
      }),
    ).toEqual(["scripts/hooks/x.mts"]);
  });
});

describe("lineCount", () => {
  it("counts lines with and without a final newline", () => {
    expect(lineCount("a\nb\n")).toBe(2);
    expect(lineCount("a\nb")).toBe(2);
    expect(lineCount("")).toBe(0);
  });
});

describe("checkSkill", () => {
  const md = (name: string, description = "Does X.") =>
    `---\nname: ${name}\ndescription: ${description}\n---\n`;

  it("accepts a well-formed skill", () => {
    expect(
      checkSkill("add-route", md("add-route")),
    ).toEqual([]);
  });

  it("rejects a name that differs from its folder", () => {
    expect(checkSkill("add-route", md("addRoute"))).toEqual(
      [
        'name "addRoute" must match "add-route"',
        "name must be 1-64 lowercase letters, digits, hyphens",
      ],
    );
  });

  it("rejects a missing or overlong description", () => {
    expect(checkSkill("a", md("a", ""))).toContain(
      "description is empty",
    );
    expect(
      checkSkill("a", md("a", "x".repeat(1025)))[0],
    ).toMatch(/1025 characters/);
  });

  it("rejects a missing SKILL.md", () => {
    expect(checkSkill("a", undefined)).toEqual([
      "missing SKILL.md",
    ]);
  });
});

describe("checkAgentConfig", () => {
  let root = "";
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  async function repo(files: Record<string, string>) {
    root = await mkdtemp(join(tmpdir(), "agent-config-"));
    for (const [path, text] of Object.entries(files)) {
      await mkdir(dirname(join(root, path)), {
        recursive: true,
      });
      await writeFile(join(root, path), text);
    }
    return root;
  }

  const pkg = JSON.stringify({
    scripts: { build: "tsc", test: "vitest" },
  });

  it("passes Relay's own config", async () => {
    const relay = fileURLToPath(
      new URL("..", import.meta.url),
    );
    expect(await checkAgentConfig(relay)).toEqual([]);
  });

  it("flags stale paths, scripts and imports", async () => {
    await repo({
      "package.json": pkg,
      "src/app.ts": "",
      "AGENTS.md":
        "Code is in `src/app.ts` and `src/old.ts`.\n" +
        "Again: `src/old.ts`.\n" +
        "Run `pnpm build` then `pnpm test:unit`.\n",
      "CLAUDE.md": "@AGENTS.md\n@docs/gone.md\n",
    });
    expect(await checkAgentConfig(root)).toEqual([
      {
        file: "AGENTS.md",
        problem:
          "mentions `src/old.ts`, which does not exist",
      },
      {
        file: "AGENTS.md",
        problem: "`pnpm test:unit` is not a script",
      },
      {
        file: "CLAUDE.md",
        problem:
          "imports @docs/gone.md, which does not exist",
      },
    ]);
  });

  it("flags an instruction file over the line budget", async () => {
    await repo({
      "package.json": pkg,
      "AGENTS.md": "- a rule\n".repeat(80),
    });
    expect(await checkAgentConfig(root)).toEqual([
      { file: "AGENTS.md", problem: "80 lines (max 60)" },
    ]);
  });

  it("flags hooks that call missing scripts", async () => {
    await repo({
      "package.json": pkg,
      ".claude/settings.json": JSON.stringify({
        hooks: {
          PostToolUse: [
            {
              hooks: [
                {
                  type: "command",
                  command: "node scripts/hooks/gone.mts",
                },
              ],
            },
          ],
        },
      }),
    });
    expect(await checkAgentConfig(root)).toEqual([
      {
        file: ".claude/settings.json",
        problem:
          "runs scripts/hooks/gone.mts, which does not exist",
      },
    ]);
  });

  it("flags a skills copy instead of a link", async () => {
    const skill = "---\nname: s\ndescription: d\n---\n";
    await repo({
      "package.json": pkg,
      ".agents/skills/s/SKILL.md": skill,
      ".claude/skills/s/SKILL.md": skill,
    });
    expect(await checkAgentConfig(root)).toEqual([
      {
        file: ".claude/skills",
        problem: "must be a symlink to ../.agents/skills",
      },
    ]);
  });

  it.each([false, true])(
    "flags a missing or dangling skills link (dangling: %s)",
    async (dangling) => {
      await repo({
        "package.json": pkg,
        ".agents/skills/s/SKILL.md":
          "---\nname: s\ndescription: d\n---\n",
      });
      if (dangling) {
        await mkdir(join(root, ".claude"));
        await symlink(
          "../missing",
          join(root, ".claude/skills"),
        );
      }
      expect(await checkAgentConfig(root)).toEqual([
        {
          file: ".claude/skills",
          problem: "must be a symlink to ../.agents/skills",
        },
      ]);
    },
  );

  it("accepts the symlink", async () => {
    await repo({
      "package.json": pkg,
      ".agents/skills/s/SKILL.md":
        "---\nname: s\ndescription: d\n---\n",
    });
    await mkdir(join(root, ".claude"));
    await symlink(
      "../.agents/skills",
      join(root, ".claude/skills"),
    );
    expect(await checkAgentConfig(root)).toEqual([]);
  });

  it("flags a token committed in MCP config", async () => {
    await repo({
      "package.json": pkg,
      ".mcp.json": JSON.stringify({
        mcpServers: {
          github: {
            headers: {
              Authorization: `Bearer ghp_${"a".repeat(36)}`,
            },
          },
        },
      }),
    });
    expect(await checkAgentConfig(root)).toEqual([
      {
        file: ".mcp.json",
        problem: "looks like a secret: ghp_aa...",
      },
    ]);
  });

  it("flags a sub-agent without a description", async () => {
    await repo({
      "package.json": pkg,
      ".claude/agents/reviewer.md":
        "---\nname: reviewer\n---\n",
    });
    expect(await checkAgentConfig(root)).toEqual([
      {
        file: ".claude/agents/reviewer.md",
        problem: "needs name and description front matter",
      },
    ]);
  });
});
