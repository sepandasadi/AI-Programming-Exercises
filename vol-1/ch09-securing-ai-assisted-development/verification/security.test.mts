import assert from "node:assert/strict";
import { test } from "node:test";

const implementation =
  process.env.RELAY_LAB_STARTER === "1" ? "starter" : "solution";
const { decideIssueRead } = (await import(
  `../${implementation}/issue-gate.mts`
)) as typeof import("../solution/issue-gate.mts");
const { unapprovedDependencies } = (await import(
  `../${implementation}/check-dependencies.mts`
)) as typeof import("../solution/check-dependencies.mts");

const allowedIssue = "relay/support#42";
const nextIssue = "relay/support#43";
const allowedRead = { tool: "readIssue", issue: allowedIssue };

test("tool gate allows the exact authorized read", () => {
  assert.deepEqual(decideIssueRead(allowedRead, allowedIssue), {
    outcome: "allow",
    issue: allowedIssue,
  });
});

test("tool gate denies a read outside the approved issue", () => {
  const proposal = { tool: "readIssue", issue: nextIssue };
  assert.deepEqual(decideIssueRead(proposal, allowedIssue), {
    outcome: "deny",
  });
});

test("tool gate denies a read from a different repository", () => {
  const proposal = { tool: "readIssue", issue: "relay/private#42" };
  assert.deepEqual(decideIssueRead(proposal, allowedIssue), {
    outcome: "deny",
  });
});

test("tool gate denies state changes", () => {
  for (const issue of [allowedIssue, nextIssue]) {
    const proposal = { tool: "addLabel", issue };
    assert.deepEqual(decideIssueRead(proposal, issue), {
      outcome: "deny",
    });
  }
});

test("tool gate denies an unknown tool", () => {
  const proposal = { tool: "unknown", issue: allowedIssue };
  assert.deepEqual(decideIssueRead(proposal, allowedIssue), {
    outcome: "deny",
  });
});

test("tool gate excludes extra request content from a denial", () => {
  const proposal = {
    ...allowedRead,
    note: "SYNTHETIC_REQUEST_TEXT",
  };
  assert.deepEqual(decideIssueRead(proposal, allowedIssue), {
    outcome: "deny",
  });
});

test("tool gate denies malformed proposals", () => {
  for (const proposal of [
    null,
    [],
    "readIssue",
    {},
    { tool: "readIssue" },
    { tool: "readIssue", issue: 42 },
  ]) {
    assert.deepEqual(decideIssueRead(proposal, allowedIssue), {
      outcome: "deny",
    });
  }
});

test("tool gate uses the trusted grant for the current task", () => {
  assert.deepEqual(decideIssueRead(allowedRead, nextIssue), {
    outcome: "deny",
  });
  assert.deepEqual(
    decideIssueRead({ ...allowedRead, issue: nextIssue }, nextIssue),
    { outcome: "allow", issue: nextIssue },
  );
});

const reviewed = {
  name: "@example/relay-text",
  version: "1.0.0",
  source: "https://registry.example.invalid",
};
const approved = [reviewed];

test("dependency gate clears the exact reviewed package", () => {
  assert.deepEqual(unapprovedDependencies([{ ...reviewed }], approved), []);
});

test("dependency gate holds an unreviewed name", () => {
  const candidate = { ...reviewed, name: "@example/relay-note-helper" };
  assert.deepEqual(unapprovedDependencies([candidate], approved), [candidate]);
});

test("dependency gate holds an unreviewed version", () => {
  const candidate = { ...reviewed, version: "1.0.1" };
  const otherPackage = { ...candidate, name: "@example/relay-notes" };
  assert.deepEqual(
    unapprovedDependencies([candidate], [...approved, otherPackage]),
    [candidate],
  );
});

test("dependency gate holds an unreviewed source", () => {
  const candidate = { ...reviewed, source: "https://other.example.invalid" };
  assert.deepEqual(unapprovedDependencies([candidate], approved), [candidate]);
});

test("dependency gate holds every entry when approvals are absent", () => {
  assert.deepEqual(unapprovedDependencies([reviewed], []), [reviewed]);
  assert.deepEqual(unapprovedDependencies([], approved), []);
});
