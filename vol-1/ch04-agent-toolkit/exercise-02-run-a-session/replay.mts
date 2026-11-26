import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workspace = mkdtempSync(join(tmpdir(), "relay-hit-"));
const sourceFile = "format-hit.mts";
const testFile = "format-hit.test.mts";
const sourcePath = join(workspace, sourceFile);
const testPath = join(workspace, testFile);
const lockedTest = new URL(`./${testFile}`, import.meta.url);

function applyRecordedEdit(target: string): boolean {
  if (target !== sourceFile) return false;
  const patch = new URL(`./solution/${sourceFile}`, import.meta.url);
  copyFileSync(patch, sourcePath);
  return true;
}

function runTests() {
  const result = spawnSync(
    process.execPath,
    ["--test", "--test-reporter=tap", testFile],
    { cwd: workspace, encoding: "utf8", env: {}, timeout: 10_000 },
  );
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`Test runner stopped by ${result.signal}`);
  assert.equal(result.stderr, "");
  return { exitCode: result.status, output: result.stdout };
}

try {
  copyFileSync(new URL(`./starter/${sourceFile}`, import.meta.url), sourcePath);
  copyFileSync(lockedTest, testPath);

  console.log(`EXPLORE  read ${sourceFile} and ${testFile}`);
  const before = readFileSync(sourcePath, "utf8");
  const testBefore = readFileSync(testPath, "utf8");
  const red = runTests();
  assert.equal(red.exitCode, 1, red.output);
  assert.match(
    red.output,
    /^not ok 1 - uses the source line away from the top of the file$/m,
  );
  assert.match(red.output, /actual: 'Rollback \(docs\/deploy\.md:1\)'/);
  assert.match(red.output, /expected: 'Rollback \(docs\/deploy\.md:27\)'/);
  assert.match(red.output, /^# fail 1$/m);
  console.log("BASELINE exit 1, 1 failed: source line is 1, expected 27");

  console.log("PLAN     use the hit's existing line in the display string");
  assert.equal(applyRecordedEdit(testFile), false);
  assert.equal(readFileSync(testPath, "utf8"), testBefore);
  console.log(`DENIED   edit ${testFile} is out of scope`);
  assert.equal(applyRecordedEdit(sourceFile), true);
  const after = readFileSync(sourcePath, "utf8");
  assert.notEqual(after, before);
  console.log(`APPLIED  edit ${sourceFile}`);

  const green = runTests();
  assert.equal(green.exitCode, 0, green.output);
  assert.match(green.output, /^# pass 2$/m);
  assert.match(green.output, /^# fail 0$/m);
  assert.equal(readFileSync(testPath, "utf8"), testBefore);
  console.log("VERIFY   exit 0, 2 passed, test file unchanged");
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
