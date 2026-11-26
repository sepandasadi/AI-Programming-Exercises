export type Observations = {
  checked: number;
  mismatches: number;
};

export type Decision = "proceed" | "hold" | "stop";

export function evaluateCanary(
  _control: Observations,
  _candidate: Observations,
): Decision {
  // Replace this placeholder with the release packet's policy.
  return "hold";
}
