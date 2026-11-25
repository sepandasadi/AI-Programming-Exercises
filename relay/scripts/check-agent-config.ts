// Checks Relay's agent configuration the way CI checks code:
// instruction files stay short and point at things that
// exist, skills are well formed, hooks call scripts that
// exist, and no committed config holds a secret.
// Usage (from relay/): tsx scripts/check-agent-config.ts
import { existsSync } from "node:fs";
import {
  readFile,
  readdir,
  readlink,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Longest instruction file allowed, in lines. */
export const MAX_INSTRUCTION_LINES = 60;
/** Agent Skills spec limits. */
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const MAX_SKILL_LINES = 500;

const SECRET =
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_\w{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|xox[abp]-[\w-]{10,})/;
const PNPM_BUILTINS = new Set([
  "install",
  "add",
  "remove",
  "exec",
  "dlx",
  "run",
  "why",
]);
const SKIP = new Set(["node_modules", "dist", ".git"]);

export type Finding = { file: string; problem: string };

/** Lines in a file; a final newline doesn't start a line. */
export function lineCount(text: string): number {
  if (text === "") return 0;
  return text.replace(/\n$/, "").split("\n").length;
}

/** Inline code spans in Markdown, outside fenced blocks. */
export function codeSpans(markdown: string): string[] {
  const prose = markdown.replace(/^```[\s\S]*?^```/gm, "");
  return [...prose.matchAll(/`([^`\n]+)`/g)].map(
    (m) => m[1]!,
  );
}

/** Spans that name a repo path: contain a slash, no
 * placeholders, globs, spaces or package scopes. */
export function pathSpans(markdown: string): string[] {
  return codeSpans(markdown).filter(
    (s) =>
      s.includes("/") &&
      !/[\s<>*$@{}()"']/.test(s) &&
      !s.startsWith("//") &&
      !/^https?:/.test(s),
  );
}

/** `pnpm <script>` and `pnpm --filter <pkg> <script>`. */
export function pnpmScripts(
  markdown: string,
): { filter?: string; script: string }[] {
  const out: { filter?: string; script: string }[] = [];
  for (const span of codeSpans(markdown)) {
    for (const m of span.matchAll(
      /\bpnpm(?: --filter (\S+))? ([a-z][\w:-]*)/g,
    )) {
      if (PNPM_BUILTINS.has(m[2]!)) continue;
      out.push(
        m[1]
          ? { filter: m[1], script: m[2]! }
          : { script: m[2]! },
      );
    }
  }
  return out;
}

/** The YAML front matter's top-level `key: value` pairs.
 * Enough for SKILL.md and agent files; not a YAML parser. */
export function frontMatter(
  markdown: string,
): Record<string, string> | undefined {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  if (!m) return undefined;
  const fields: Record<string, string> = {};
  let key = "";
  for (const line of m[1]!.split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (kv) {
      key = kv[1]!;
      fields[key] = kv[2]!.replace(/^["']|["']$/g, "");
    } else if (key && /^\s+\S/.test(line)) {
      // A folded or continued value.
      fields[key] = `${fields[key]} ${line.trim()}`.trim();
    }
  }
  return fields;
}

export function checkSkill(
  dirName: string,
  skillMd: string | undefined,
): string[] {
  if (skillMd === undefined) return ["missing SKILL.md"];
  const fm = frontMatter(skillMd);
  if (!fm) return ["SKILL.md has no front matter"];
  const problems: string[] = [];
  const name = fm["name"] ?? "";
  const description = fm["description"] ?? "";
  if (name !== dirName)
    problems.push(`name "${name}" must match "${dirName}"`);
  if (!SKILL_NAME.test(name) || name.length > MAX_NAME)
    problems.push(
      "name must be 1-64 lowercase letters, digits, hyphens",
    );
  if (description.length === 0)
    problems.push("description is empty");
  if (description.length > MAX_DESCRIPTION)
    problems.push(
      `description is ${description.length} characters ` +
        `(max ${MAX_DESCRIPTION})`,
    );
  const lines = lineCount(skillMd);
  if (lines > MAX_SKILL_LINES)
    problems.push(`SKILL.md is ${lines} lines (max 500)`);
  return problems;
}

/** Script paths a hook command runs, e.g.
 * `node "$CLAUDE_PROJECT_DIR"/scripts/hooks/x.mjs`. */
export function hookScripts(config: unknown): string[] {
  const text = JSON.stringify(config ?? {});
  return [
    ...text.matchAll(
      /(scripts\/[\w./-]+\.(?:mjs|js|sh|ts))/g,
    ),
  ].map((m) => m[1]!);
}

async function walk(
  dir: string,
  match: (name: string) => boolean,
): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, {
    withFileTypes: true,
  })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory())
      out.push(...(await walk(p, match)));
    else if (match(e.name)) out.push(p);
  }
  return out;
}

const read = (p: string) =>
  readFile(p, "utf8").catch(() => undefined);

export async function checkAgentConfig(
  root: string,
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const add = (file: string, problem: string) =>
    findings.push({ file: relative(root, file), problem });
  const pkg = JSON.parse(
    (await read(join(root, "package.json"))) ?? "{}",
  );
  const scripts = new Set(Object.keys(pkg.scripts ?? {}));

  // 1. Instruction files: short, and every path and
  //    command they mention exists.
  const instructions = await walk(
    root,
    (n) => n === "AGENTS.md" || n === "CLAUDE.md",
  );
  for (const file of instructions) {
    const text = (await read(file)) ?? "";
    const lines = lineCount(text);
    if (lines > MAX_INSTRUCTION_LINES)
      add(
        file,
        `${lines} lines (max ${MAX_INSTRUCTION_LINES})`,
      );
    for (const span of new Set(pathSpans(text))) {
      const bases = [dirname(file), root, dirname(root)];
      if (!bases.some((b) => existsSync(join(b, span))))
        add(
          file,
          `mentions \`${span}\`, which does not exist`,
        );
    }
    for (const { filter, script } of pnpmScripts(text)) {
      const ok = filter
        ? await filteredScriptExists(root, filter, script)
        : scripts.has(script);
      if (!ok)
        add(file, `\`pnpm ${script}\` is not a script`);
    }
    for (const m of text.matchAll(/^@(\S+)$/gm)) {
      if (!existsSync(join(dirname(file), m[1]!)))
        add(file, `imports @${m[1]}, which does not exist`);
    }
  }

  // 2. Skills, in every folder the tools read them from.
  for (const skillsDir of SKILL_DIRS.map((d) =>
    join(root, d),
  )) {
    if (!existsSync(skillsDir)) continue;
    for (const e of await readdir(skillsDir, {
      withFileTypes: true,
    })) {
      if (!e.isDirectory()) continue;
      const md = await read(
        join(skillsDir, e.name, "SKILL.md"),
      );
      for (const p of checkSkill(e.name, md))
        add(join(skillsDir, e.name), p);
    }
  }

  //    Claude Code reads only .claude/skills; it must be a
  //    link to .agents/skills, or the copies drift.
  const mirror = join(root, ".claude/skills");
  const sharedSkills = join(root, ".agents/skills");
  if (existsSync(sharedSkills) || existsSync(mirror)) {
    const target = await readlink(mirror).catch(
      () => undefined,
    );
    if (
      target !== "../.agents/skills" ||
      !existsSync(mirror)
    ) {
      add(mirror, "must be a symlink to ../.agents/skills");
    }
  }

  // 3. Hooks call scripts that exist.
  for (const file of HOOK_CONFIGS.map((f) =>
    join(root, f),
  )) {
    const text = await read(file);
    if (text === undefined) continue;
    for (const script of hookScripts(JSON.parse(text))) {
      if (!existsSync(join(root, script)))
        add(file, `runs ${script}, which does not exist`);
    }
  }

  // 4. Sub-agents have a name and a description.
  for (const dir of AGENT_DIRS.map((d) => join(root, d))) {
    if (!existsSync(dir)) continue;
    for (const file of await walk(dir, (n) =>
      n.endsWith(".md"),
    )) {
      const fm = frontMatter((await read(file)) ?? "");
      if (!fm?.["name"] || !fm["description"])
        add(
          file,
          "needs name and description front matter",
        );
    }
  }

  // 5. No secrets in committed agent config.
  for (const file of await configFiles(root)) {
    const hit = SECRET.exec((await read(file)) ?? "");
    if (hit)
      add(
        file,
        `looks like a secret: ${hit[0].slice(0, 6)}...`,
      );
  }
  return findings;
}

/** Where Relay keeps agent config (see AGENTS.md). */
export const SKILL_DIRS = [
  ".agents/skills",
  ".claude/skills",
];
export const HOOK_CONFIGS = [
  ".claude/settings.json",
  ".codex/hooks.json",
];
export const AGENT_DIRS = [".claude/agents"];
const CONFIG_ROOTS = [
  ".mcp.json",
  ".claude",
  ".agents",
  ".codex",
  "AGENTS.md",
];

async function configFiles(root: string) {
  const out: string[] = [];
  for (const entry of CONFIG_ROOTS.map((p) =>
    join(root, p),
  )) {
    if (!existsSync(entry)) continue;
    if (/\.(json|md|toml)$/.test(entry)) out.push(entry);
    else out.push(...(await walk(entry, () => true)));
  }
  return out;
}

async function filteredScriptExists(
  root: string,
  filter: string,
  script: string,
) {
  for (const dir of ["apps", "packages"]) {
    const base = join(root, dir);
    if (!existsSync(base)) continue;
    for (const name of await readdir(base)) {
      const pkg = await read(
        join(base, name, "package.json"),
      );
      if (!pkg) continue;
      const json = JSON.parse(pkg);
      if (json.name === filter)
        return script in (json.scripts ?? {});
    }
  }
  return false;
}

async function main() {
  const root = fileURLToPath(
    new URL("..", import.meta.url),
  );
  const findings = await checkAgentConfig(root);
  for (const f of findings)
    console.log(`FAIL    ${f.file}: ${f.problem}`);
  if (findings.length === 0)
    console.log("ok      agent config");
  process.exitCode = findings.length > 0 ? 1 : 0;
}

if (
  import.meta.url === pathToFileURL(process.argv[1]!).href
) {
  await main();
}
