import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDeadline } from "../src/deadline.mts";
import { formatHandoff } from "../src/handoff.mts";
import { ownershipHint } from "../src/ownership.mts";
import { priorityLabel } from "../src/priority.mts";

test("priority: maps all four existing codes", () => {
  assert.deepEqual(
    [
      priorityLabel("P0"),
      priorityLabel("P1"),
      priorityLabel("P2"),
      priorityLabel("P3"),
    ],
    ["Critical", "High", "Normal", "Low"],
  );
});

test("deadline: displays the UTC date and minute", () => {
  assert.equal(
    formatDeadline("2026-11-25T21:45:59.120Z"),
    "2026-11-25 21:45 UTC",
  );
  assert.equal(
    formatDeadline("2026-01-01T00:00:00.000Z"),
    "2026-01-01 00:00 UTC",
  );
});

test("ownership: distinguishes assigned and unassigned issues", () => {
  assert.equal(ownershipHint(false), "Assign an owner");
  assert.equal(ownershipHint(true), "Confirm the owner");
});

test("integration: preserves all three fields in the handoff", () => {
  const result = formatHandoff({
    number: 42,
    priority: "P1",
    respondBy: "2026-11-25T21:45:00.000Z",
    hasOwner: false,
  });
  assert.equal(
    result,
    "#42 High | Respond by 2026-11-25 21:45 UTC | Assign an owner",
  );
});

test("integration: shows the correct hint for an assigned issue", () => {
  const result = formatHandoff({
    number: 43,
    priority: "P0",
    respondBy: "2026-01-01T00:00:00.000Z",
    hasOwner: true,
  });
  assert.equal(
    result,
    "#43 Critical | Respond by 2026-01-01 00:00 UTC | Confirm the owner",
  );
});
