// The hooks run as separate processes, as the agent tools
// run them: JSON on stdin, an exit code and stderr back.
import { spawnSync } from "node:child_process";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

const here = (name: string) =>
  fileURLToPath(new URL(name, import.meta.url));
const ROOT = fileURLToPath(
  new URL("../..", import.meta.url),
);

function run(script: string, input: unknown) {
  const res = spawnSync(process.execPath, [here(script)], {
    input:
      typeof input === "string"
        ? input
        : JSON.stringify(input),
    encoding: "utf8",
  });
  return { code: res.status, stderr: res.stderr };
}

describe("protect-env.mjs", () => {
  const guard = (input: unknown) =>
    run("protect-env.mjs", input);

  it("blocks Claude Code reading .env", () => {
    const r = guard({
      tool_name: "Read",
      tool_input: { file_path: "/work/relay/.env" },
    });
    expect(r.code).toBe(2);
    expect(r.stderr).toContain(".env holds secrets");
  });

  it("blocks .env.local and other variants", () => {
    for (const file_path of [
      "relay/.env.local",
      ".env.production",
    ]) {
      expect(
        guard({ tool_input: { file_path } }).code,
      ).toBe(2);
    }
  });

  it("allows .env.example", () => {
    const r = guard({
      tool_input: { file_path: "relay/.env.example" },
    });
    expect(r.code).toBe(0);
  });

  it("blocks a shell command that names .env", () => {
    const r = guard({
      tool_name: "Bash",
      tool_input: { command: "cat apps/api/../../.env" },
    });
    expect(r.code).toBe(2);
  });

  it("reads Codex's array-form shell command", () => {
    const r = guard({
      tool_input: { command: ["bash", "-lc", "cat .env"] },
    });
    expect(r.code).toBe(2);
  });

  it("reads Copilot's JSON-string arguments", () => {
    const r = guard({
      toolName: "view",
      toolArgs: JSON.stringify({ path: ".env" }),
    });
    expect(r.code).toBe(2);
  });

  it("reads Cursor's top-level fields", () => {
    expect(guard({ command: "source .env" }).code).toBe(2);
    expect(guard({ file_path: "/r/.env" }).code).toBe(2);
  });

  it("allows names that only look similar", () => {
    for (const command of [
      "echo $process.env.PORT",
      "cat .envrc.md",
      "ls src/env.ts",
      "grep -r process.env apps",
    ]) {
      expect(guard({ tool_input: { command } }).code).toBe(
        0,
      );
    }
  });

  it("fails closed on input it cannot parse", () => {
    expect(guard("not json").code).toBe(2);
  });
});

describe("format-edited.mjs", () => {
  let dir = "";
  beforeAll(async () => {
    dir = await mkdtemp(join(ROOT, ".hook-test-"));
  });
  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("formats a TypeScript file the agent wrote", async () => {
    const file = join(dir, "messy.ts");
    await writeFile(file, "export const a = {b:1,c:[1,2]}");
    const r = run("format-edited.mjs", {
      tool_name: "Write",
      tool_input: { file_path: file },
    });
    expect(r.code).toBe(0);
    expect(await readFile(file, "utf8")).toBe(
      "export const a = { b: 1, c: [1, 2] };\n",
    );
  });

  it("reports a file Prettier cannot parse", async () => {
    const file = join(dir, "broken.ts");
    await writeFile(file, "export const = ;");
    const r = run("format-edited.mjs", {
      tool_input: { file_path: file },
    });
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("could not format");
  });

  it("leaves Markdown and files outside relay/ alone", async () => {
    const md = join(dir, "notes.md");
    await writeFile(md, "#  Title\n");
    for (const file_path of [md, "/etc/hosts"]) {
      const r = run("format-edited.mjs", {
        tool_input: { file_path },
      });
      expect(r.code).toBe(0);
    }
    expect(await readFile(md, "utf8")).toBe("#  Title\n");
  });

  it("does nothing for a deleted file", () => {
    const r = run("format-edited.mjs", {
      tool_input: { file_path: join(dir, "gone.ts") },
    });
    expect(r.code).toBe(0);
  });
});
