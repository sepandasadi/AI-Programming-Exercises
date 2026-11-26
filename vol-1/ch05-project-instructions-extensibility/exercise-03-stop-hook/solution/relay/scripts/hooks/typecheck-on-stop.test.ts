import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HOOK = fileURLToPath(
  new URL("typecheck-on-stop.mts", import.meta.url),
);

function stop(event: unknown, check: string) {
  const res = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify(event),
    encoding: "utf8",
    env: { ...process.env, RELAY_STOP_CHECK: check },
  });
  return { code: res.status, stderr: res.stderr };
}

const PASS = "node -e 'process.exit(0)'";
const FAIL =
  'node -e \'console.log("src/a.ts(3,1): error TS2322");' +
  " process.exit(2)'";

describe("typecheck-on-stop.mts", () => {
  it("lets the agent stop when the check passes", () => {
    expect(
      stop({ hook_event_name: "Stop" }, PASS).code,
    ).toBe(0);
  });

  it("blocks with the errors when the check fails", () => {
    const r = stop({ hook_event_name: "Stop" }, FAIL);
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("error TS2322");
    expect(r.stderr).toContain("Fix these errors");
  });

  it("lets the agent stop on the second try (no loop)", () => {
    const r = stop(
      { hook_event_name: "Stop", stop_hook_active: true },
      FAIL,
    );
    expect(r.code).toBe(0);
  });

  it("runs the real typecheck, which passes on Relay", () => {
    const res = spawnSync(process.execPath, [HOOK], {
      input: "{}",
      encoding: "utf8",
    });
    expect(res.status).toBe(0);
  }, 120_000);
});
