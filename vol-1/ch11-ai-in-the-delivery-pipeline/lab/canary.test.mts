import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateCanary } from "./gate.mts";
import { observe, runRollback } from "./replay.mts";

const clean = (checked: number) => ({ checked, mismatches: 0 });

test("clean observations meet the minimum in both arms", () => {
  assert.equal(evaluateCanary(clean(20), clean(20)), "proceed");
});

test("either undersampled arm holds the rollout", () => {
  assert.equal(evaluateCanary(clean(20), clean(19)), "hold");
  assert.equal(evaluateCanary(clean(0), clean(20)), "hold");
});

test("a verified candidate mismatch stops even an incomplete window", () => {
  assert.equal(
    evaluateCanary(clean(20), { checked: 1, mismatches: 1 }),
    "stop",
  );
});

test("a control mismatch stops promotion too", () => {
  assert.equal(
    evaluateCanary({ checked: 20, mismatches: 1 }, clean(20)),
    "stop",
  );
});

test("the healthy fixture checks both sides of the flag boundary", () => {
  const window = observe("healthy", 10);
  assert.deepEqual(window.control, clean(20));
  assert.deepEqual(window.candidate, clean(20));
  assert.equal(window.belowBoundary, "candidate");
  assert.equal(window.atBoundary, "control");
});

test("the short fixture holds with clean observations", () => {
  const window = observe("short", 10);
  assert.deepEqual(window.control, clean(8));
  assert.deepEqual(window.candidate, clean(8));
  assert.equal(evaluateCanary(window.control, window.candidate), "hold");
});

test("the regressed candidate loses UTC on midnight handoffs", () => {
  const window = observe("regression", 10);
  assert.deepEqual(window.control, clean(20));
  assert.deepEqual(window.candidate, { checked: 20, mismatches: 10 });
  assert.deepEqual(window.firstMismatch, {
    arm: "candidate",
    bucket: 0,
    issue: 43,
    expected:
      "#43 Critical | Respond by 2026-01-01 00:00 UTC | Confirm the owner",
    actual: "#43 Critical | Respond by 2026-01-01 00:00 | Confirm the owner",
  });
  assert.equal(evaluateCanary(window.control, window.candidate), "stop");
});

test("flag off restores the handoff for the previously exposed cohort", () => {
  const window = runRollback();
  assert.equal(window.restored, true);
  assert.equal(window.belowBoundary, "control");
  assert.equal(window.atBoundary, "control");
  assert.deepEqual(window.control, clean(40));
  assert.deepEqual(window.candidate, clean(0));
  assert.deepEqual(window.candidateBuckets, []);
  assert.equal(window.firstMismatch, null);
});
