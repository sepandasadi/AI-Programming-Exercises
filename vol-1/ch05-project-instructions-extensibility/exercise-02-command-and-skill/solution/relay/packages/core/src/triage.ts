import { addBusinessTime } from "./business-time.js";
import { tokenize } from "./terms.js";

/** Most urgent first: the index is the N in `priority:pN`. */
export const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Issue = {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  createdAt: Date;
};

export type Triage = {
  number: number;
  priority: Priority;
  reason: string;
  respondBy: Date;
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** Time allowed before respond-by, per priority. See the spec's SLA table. */
const SLA = {
  P0: { ms: 60 * MINUTE, clock: "calendar" },
  P1: { ms: 4 * HOUR, clock: "business" },
  P2: { ms: 16 * HOUR, clock: "business" },
  P3: { ms: 40 * HOUR, clock: "business" },
} satisfies Record<
  Priority,
  { ms: number; clock: "calendar" | "business" }
>;

export type SlaEntry = {
  priority: Priority;
  hours: number;
  clock: "calendar" | "business";
};

/** The respond-by allowance per priority, most urgent first,
 * read from the same table `triageIssue` uses. */
export function slaTable(): SlaEntry[] {
  return PRIORITIES.map((priority) => ({
    priority,
    hours: SLA[priority].ms / HOUR,
    clock: SLA[priority].clock,
  }));
}

const PRIORITY_LABEL = /^priority:p([0-3])$/;
const P1_TITLE_TERMS = new Set([
  "outage",
  "incident",
  "breach",
]);

/** The rules, tried in order; the first that applies decides. */
function decide(
  title: string,
  rawLabels: string[],
): { priority: Priority; reason: string } {
  const labels = rawLabels.map((l) =>
    l.trim().toLowerCase(),
  );

  // 1. priority:p0 to priority:p3; the most urgent wins.
  const levels = labels
    .map((l) => PRIORITY_LABEL.exec(l)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number);
  // With no levels, n is Infinity, which indexes nothing.
  const n = Math.min(...levels);
  const priority = PRIORITIES[n];
  if (priority) {
    return { priority, reason: `label priority:p${n}` };
  }

  // 2. security label.
  if (labels.includes("security")) {
    return { priority: "P1", reason: "label security" };
  }

  // 3. outage, incident or breach as a whole title term.
  const term = tokenize(title).find((t) =>
    P1_TITLE_TERMS.has(t.term),
  );
  if (term) {
    return {
      priority: "P1",
      reason: `title term ${term.term}`,
    };
  }

  // 4. bug label.
  if (labels.includes("bug")) {
    return { priority: "P2", reason: "label bug" };
  }

  // 5. Everything else.
  return { priority: "P3", reason: "default" };
}

/**
 * Gives an issue a priority, the rule that decided it and a respond-by
 * time. Pure: depends only on the issue. See docs/specs/issue-triage.md.
 *
 * Throws a RangeError if `issue.createdAt` is an invalid Date.
 */
export function triageIssue(issue: Issue): Triage {
  const start = issue.createdAt.getTime();
  if (Number.isNaN(start)) {
    throw new RangeError(
      "triageIssue: createdAt is an invalid Date",
    );
  }

  const { priority, reason } = decide(
    issue.title,
    issue.labels,
  );
  const sla = SLA[priority];
  const respondBy =
    sla.clock === "calendar"
      ? new Date(start + sla.ms)
      : addBusinessTime(issue.createdAt, sla.ms);

  return {
    number: issue.number,
    priority,
    reason,
    respondBy,
  };
}
