export type Decision =
  { outcome: "allow"; issue: string } | { outcome: "deny" };

export function decideIssueRead(
  proposal: unknown,
  allowedIssue: string,
): Decision {
  if (
    typeof proposal === "object" &&
    proposal !== null &&
    !Array.isArray(proposal) &&
    Object.keys(proposal).length === 2 &&
    Object.hasOwn(proposal, "tool") &&
    Object.hasOwn(proposal, "issue") &&
    "tool" in proposal &&
    "issue" in proposal &&
    proposal.tool === "readIssue" &&
    proposal.issue === allowedIssue
  ) {
    return { outcome: "allow", issue: allowedIssue };
  }
  return { outcome: "deny" };
}
