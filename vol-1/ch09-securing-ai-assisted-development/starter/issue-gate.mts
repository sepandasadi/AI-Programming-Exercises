export type Decision =
  { outcome: "allow"; issue: string } | { outcome: "deny" };

export function decideIssueRead(
  _proposal: unknown,
  _allowedIssue: string,
): Decision {
  // Add the approved read path. Preserve denial by default.
  return { outcome: "deny" };
}
