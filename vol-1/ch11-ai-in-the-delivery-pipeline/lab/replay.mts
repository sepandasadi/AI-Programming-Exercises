import { fullBuckets, handoffs, shortBuckets } from "./fixtures.mts";
import type { Observations } from "./gate.mts";

export type Scenario = "healthy" | "short" | "regression";
type Arm = "control" | "candidate";
type Handoff = Omit<(typeof handoffs)[number], "expected">;
type Mismatch = {
  arm: Arm;
  bucket: number;
  issue: number;
  expected: string;
  actual: string;
};

const priorityLabels = { P0: "Critical", P1: "High" };

function formatHandoff(
  { number, priority, respondBy, hasOwner }: Handoff,
  arm: Arm,
  scenario: Scenario,
): string {
  const date = respondBy.slice(0, 10);
  const time = respondBy.slice(11, 16);
  const midnightRegression =
    arm === "candidate" && scenario === "regression" && time === "00:00";
  const deadline = midnightRegression
    ? `${date} ${time}`
    : `${date} ${time} UTC`;
  const owner = hasOwner ? "Confirm the owner" : "Assign an owner";
  return [
    `#${number} ${priorityLabels[priority]}`,
    `Respond by ${deadline}`,
    owner,
  ].join(" | ");
}

export function observe(scenario: Scenario, flagPercent: 0 | 10) {
  const buckets = scenario === "short" ? shortBuckets : fullBuckets;
  const observations: Record<Arm, Observations> = {
    control: { checked: 0, mismatches: 0 },
    candidate: { checked: 0, mismatches: 0 },
  };
  const routes = new Map<number, Arm>();
  let firstMismatch: Mismatch | null = null;

  for (const bucket of buckets) {
    const arm = bucket < flagPercent ? "candidate" : "control";
    routes.set(bucket, arm);
    for (const { expected, ...handoff } of handoffs) {
      observations[arm].checked += 1;
      const actual = formatHandoff(handoff, arm, scenario);
      if (actual !== expected) {
        observations[arm].mismatches += 1;
        firstMismatch ??= {
          arm,
          bucket,
          issue: handoff.number,
          expected,
          actual,
        };
      }
    }
  }

  return {
    ...observations,
    belowBoundary: routes.get(9),
    atBoundary: routes.get(10),
    candidateBuckets: [...routes.keys()].filter(
      (bucket) => routes.get(bucket) === "candidate",
    ),
    firstMismatch,
  };
}

export function runRollback() {
  const window = observe("regression", 0);
  const restored =
    window.control.checked === fullBuckets.length * handoffs.length &&
    window.control.mismatches === 0 &&
    window.candidate.checked === 0;
  return { restored, ...window };
}
